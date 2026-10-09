import { reachableTask } from '../projectAccess';
import { getPeopleOnProject } from '$lib/server/members/getPeopleOnProject';
import { noSuchTask } from './describeTask';
import { objectSchema, readText, textField } from '../actionTypes';
import { setTaskAssignees } from '$lib/server/projects/setTaskAssignees';
import type { McpAction } from '../actionTypes';
import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';

const taskIdField = textField('The task id');
const nameEveryoneAsAList =
	'Pass accountIds as a list of ids — an empty list to unassign everyone.';

export const taskTeamActions: McpAction[] = [
	{
		name: 'set_task_assignees',
		area: 'tasks',
		audience: 'everyone',
		isWrite: true,
		summary: 'say who on the project is working on a task',
		guidance:
			'This replaces the whole list, so name everyone who should be on the task, not ' +
			'only the person joining. An empty list leaves the task unassigned. Only people on the ' +
			'project can be assigned; list_project_people gives their ids.',
		inputSchema: objectSchema(
			{
				taskId: taskIdField,
				accountIds: {
					type: 'array',
					items: { type: 'string' },
					description: 'Everyone who should be on the task'
				}
			},
			['taskId', 'accountIds']
		),
		run: async (caller, input) => {
			const task = await reachableTask(caller, readText(input, 'taskId'));
			if (task === null) return noSuchTask;
			const people = await getPeopleOnProject(caller.supabase, task.projectId);
			const chosenIds = parseAccountIds(input);
			if (chosenIds === null) return nameEveryoneAsAList;
			const chosen = people.filter((person) => chosenIds.includes(person.id));
			if (chosen.length !== chosenIds.length) return chooseFromProject(people);
			await setTaskAssignees(caller.supabase, task.id, chosenIds);
			return `"${task.title}" is now with ${namesOf(chosen)}.`;
		}
	}
];

function parseAccountIds(input: Record<string, unknown>): string[] | null {
	const chosenIds = input.accountIds;
	if (!Array.isArray(chosenIds)) return null;
	return [...new Set(chosenIds.map(String))];
}

function namesOf(people: ProjectPerson[]): string {
	if (people.length === 0) return 'nobody';
	return people.map((person) => person.name).join(', ');
}

function chooseFromProject(people: ProjectPerson[]): string {
	const choices = people.map((person) => `${person.name} (id: ${person.id})`).join(', ');
	return `Not everyone you named is on this project. The people you can assign are: ${choices}.`;
}
