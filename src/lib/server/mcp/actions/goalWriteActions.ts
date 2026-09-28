import { createGoal } from '$lib/server/goals/createGoal';
import { goalIdField, projectIdField } from './goalReadActions';
import { goalStatusOrder, parseGoalStatus } from '$lib/data/goalStatus';
import { noSuchGoal } from './describeGoal';
import { noReachableProject, reachableGoal, reachableProject } from '../projectAccess';
import { objectSchema, proseField, readOptionalText, readText, textField } from '../actionTypes';
import { updateGoalStatus } from '$lib/server/goals/updateGoal';
import type { McpAction } from '../actionTypes';

export const goalWriteActions: McpAction[] = [
	{
		name: 'create_goal',
		area: 'goals',
		audience: 'everyone',
		isWrite: true,
		summary: 'add a high level, measurable goal to a project',
		guidance:
			'Call find_goals first and show the person any match. Create only when they have said ' +
			'nothing existing fits. A goal is high level and measurable: the measure says how we ' +
			'will know it has been met, in words both sides can check.',
		inputSchema: objectSchema(
			{
				projectId: projectIdField,
				title: textField('The goal in one line'),
				measure: proseField('How we will know it is met')
			},
			['projectId', 'title']
		),
		run: async (caller, input) => {
			const project = await reachableProject(caller, readText(input, 'projectId'));
			if (project === null) return noReachableProject;
			const title = readOptionalText(input, 'title');
			if (title === null) return 'A goal needs a title. Say what it is and try again.';
			const seed = { title, measure: readText(input, 'measure') };
			const goalId = await createGoal(caller.supabase, project.id, seed, caller.accountId);
			return `"${title}" added to ${project.name} (goal id: ${goalId}).`;
		}
	},
	{
		name: 'set_goal_status',
		area: 'goals',
		audience: 'everyone',
		isWrite: true,
		summary: 'mark a goal open, met or dropped',
		inputSchema: objectSchema(
			{ goalId: goalIdField, status: textField(`One of ${goalStatusOrder.join(', ')}`) },
			['goalId', 'status']
		),
		run: async (caller, input) => {
			const goal = await reachableGoal(caller, readText(input, 'goalId'));
			if (goal === null) return noSuchGoal;
			const status = parseGoalStatus(readText(input, 'status'));
			await updateGoalStatus(caller.supabase, goal.id, status);
			return `"${goal.title}" is now ${status}.`;
		}
	}
];
