import { createGoalWithTasks } from '$lib/server/goals/createGoalWithTasks';
import { goalHorizonOrder, parseGoalHorizon } from '$lib/data/goalHorizon';
import { goalTasksField, goalTasksRefusal, listedTaskSeeds } from './goalTaskSeeds';
import { withRaiserAutocomplete } from '$lib/data/autocompleteStanding';
import { newTaskRefusal } from '$lib/server/projects/newTaskRefusal';
import { noReachableProject, reachableProject } from '../projectAccess';
import { objectSchema, proseField, readOptionalText, readText, textField } from '../actionTypes';
import { projectIdField } from './goalReadActions';
import { raiseAnywayField } from './similarTaskCheck';
import { similarTasksRefusal } from './similarTasksRefusal';
import { departmentField, readDepartment, isDepartmentRefused } from './departmentChoice';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { NewGoalSeed } from '$lib/server/goals/createGoal';
import type { NewTaskSeed } from '$lib/server/projects/createTask';
import type { Project } from '$lib/server/projects/projectRecord';

export const goalWithTasksAction: McpAction = {
	name: 'create_goal_with_tasks',
	area: 'goals',
	audience: 'everyone',
	isWrite: true,
	summary: 'raise a new goal and its first tasks together, all or nothing',
	guidance:
		'The way to raise a goal: read the goal and its tasks back to the person once, and on their ' +
		'yes raise them all in this one call. Either everything is raised or nothing is, so a goal ' +
		'is never left standing without its tasks. Call find_goals and find_tasks first; when open ' +
		'tasks look like these, nothing is raised until you have shown them and the person has ' +
		'chosen raiseAnyway. A development goal’s tasks are each a user story, or "FIX: <what is ' +
		'wrong>"; the tasks take the goal’s department.',
	inputSchema: objectSchema(
		{
			projectId: projectIdField,
			title: textField('The goal in one line'),
			measure: proseField('How we will know it is met'),
			horizon: textField(`One of ${goalHorizonOrder.join(', ')} — current unless said otherwise`),
			department: departmentField,
			tasks: goalTasksField,
			raiseAnyway: raiseAnywayField
		},
		['projectId', 'title', 'tasks']
	),
	run: async (caller, input) => {
		const project = await reachableProject(caller, readText(input, 'projectId'));
		if (project === null) return noReachableProject;
		const title = readOptionalText(input, 'title');
		if (title === null) return 'A goal needs a title. Say what it is and try again.';
		const department = readDepartment(input);
		if (isDepartmentRefused(department)) return department.refusal;
		const listedSeeds = listedTaskSeeds(input);
		if (listedSeeds === null) return goalTasksRefusal;
		const seeds = listedSeeds.map((seed) => withRaiserAutocomplete({ ...seed, department }, caller.isStaff));
		const refusal = await firstTaskRefusal(caller, project, seeds, input.raiseAnyway);
		if (refusal !== null) return `Nothing was raised. ${refusal}`;
		const goal = { ...goalSeedFrom(input, title), department };
		const raised = await createGoalWithTasks(caller.supabase, project.id, goal, seeds, caller.accountId);
		const heading = `"${title}" added to ${project.name} as a ${goal.horizon} goal (goal id: ${raised.goalId}), with:`;
		return [heading, ...seeds.map((seed, index) => raisedTaskLine(seed, raised.taskIds[index]))].join('\n');
	}
};

function goalSeedFrom(input: Record<string, unknown>, title: string): NewGoalSeed {
	const horizon = parseGoalHorizon(readText(input, 'horizon'));
	return { title, measure: readText(input, 'measure'), horizon };
}

function raisedTaskLine(seed: NewTaskSeed, taskId: string): string {
	return `- "${seed.title}" (task id: ${taskId})`;
}

async function firstTaskRefusal(
	caller: McpCaller,
	project: Project,
	seeds: NewTaskSeed[],
	raiseAnyway: unknown
): Promise<string | null> {
	for (const seed of seeds) {
		const shapeRefusal = await newTaskRefusal(caller.supabase, project.id, seed);
		if (shapeRefusal !== null) return `"${seed.title}": ${shapeRefusal}`;
		const similarRefusal = await similarTasksRefusal(caller, project, seed, raiseAnyway);
		if (similarRefusal !== null) return similarRefusal;
	}
	return null;
}
