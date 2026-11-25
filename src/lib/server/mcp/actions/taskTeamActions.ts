import { reachableTask } from '../projectAccess';
import { getPeopleOnProject } from '$lib/server/members/getPeopleOnProject';
import { noSuchTask } from './describeTask';
import { objectSchema, readText, textField } from '../actionTypes';
import { addTaskAssignees, getCurrentAssigneeIds, setTaskAssignees } from '$lib/server/projects/setTaskAssignees';
import { assignmentTelling } from './assignmentTelling';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';

const taskIdField = textField('The task id');
const nameEveryoneAsAList = 'Pass accountIds as a list of ids.';
const nameSomeoneToAdd = 'Pass accountIds as a list of at least one id: the people to add to the task.';

type Assigning = { caller: McpCaller; input: Record<string, unknown>; isReplacing: boolean };

export const taskTeamActions: McpAction[] = [
	{
		name: 'add_task_assignees',
		area: 'tasks',
		audience: 'everyone',
		isWrite: true,
		summary: 'put one or more people on a task beside whoever is already on it',
		guidance:
			'Use this to give a task to someone: nobody already on it is taken off, so a task that needs ' +
			'several people to act has them all. Each person added is told on their bell that the task is ' +
			'theirs. Only people on the project can be added; list_project_people gives their ids. What a ' +
			'person has to answer is still a message waiting on them (post_message with waitingOn), posted ' +
			'once they are on the task: being assigned says the task is theirs, not what you need from them.',
		inputSchema: objectSchema(
			{ taskId: taskIdField, accountIds: accountIdsField('The people to add') },
			['taskId', 'accountIds']
		),
		run: async (caller, input) => assign({ caller, input, isReplacing: false })
	},
	{
		name: 'set_task_assignees',
		area: 'tasks',
		audience: 'everyone',
		isWrite: true,
		summary: 'say exactly who on the project is on a task, taking off anyone not named',
		guidance:
			'This replaces the whole list: anyone on the task you leave out is taken off, and the answer ' +
			'names them. To give the task to one more person, use add_task_assignees instead. An empty ' +
			'list leaves the task unassigned. Only people on the project can be assigned; ' +
			'list_project_people gives their ids. A development task’s assignees are whoever builds it; ' +
			'an infrastructure, administration, sales or marketing task’s are whoever does the job. What ' +
			'a person has to give is a message waiting on them (post_message with waitingOn), never a ' +
			'task assigned to them.',
		inputSchema: objectSchema(
			{ taskId: taskIdField, accountIds: accountIdsField('Everyone who should be on the task') },
			['taskId', 'accountIds']
		),
		run: async (caller, input) => assign({ caller, input, isReplacing: true })
	}
];

function accountIdsField(description: string) {
	return { type: 'array', items: { type: 'string' }, description };
}

async function assign({ caller, input, isReplacing }: Assigning): Promise<string> {
	const task = await reachableTask(caller, readText(input, 'taskId'));
	if (task === null) return noSuchTask;
	const chosenIds = parseAccountIds(input);
	if (chosenIds === null) return nameEveryoneAsAList;
	if (!isReplacing && chosenIds.length === 0) return nameSomeoneToAdd;
	const people = await getPeopleOnProject(caller.supabase, task.projectId);
	const chosen = people.filter((person) => chosenIds.includes(person.id));
	if (chosen.length !== chosenIds.length) return chooseFromProject(people);
	const beforeIds = await getCurrentAssigneeIds(caller.supabase, task.id);
	const write = isReplacing ? setTaskAssignees : addTaskAssignees;
	await write(caller.supabase, task.id, chosenIds, caller.accountId);
	const afterIds = await getCurrentAssigneeIds(caller.supabase, task.id);
	return assignmentTelling({ title: task.title, people, beforeIds, afterIds, callerId: caller.accountId });
}

function parseAccountIds(input: Record<string, unknown>): string[] | null {
	const chosenIds = input.accountIds;
	if (!Array.isArray(chosenIds)) return null;
	return [...new Set(chosenIds.map(String))];
}

function chooseFromProject(people: ProjectPerson[]): string {
	const choices = people.map((person) => `${person.name} (id: ${person.id})`).join(', ');
	return `Not everyone you named is on this project. The people you can assign are: ${choices}.`;
}
