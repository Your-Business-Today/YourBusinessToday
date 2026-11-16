import { findProjectPerson } from '$lib/server/members/findProjectPerson';
import { getPeopleOnProject } from '$lib/server/members/getPeopleOnProject';
import { getPeopleIWorkWith } from '$lib/server/members/getPeopleIWorkWith';
import { isNobodyNamed } from '$lib/data/batonRule';
import { readOptionalText } from '../actionTypes';
import { reachableTask } from '../projectAccess';
import type { McpCaller } from '../resolveMcpCaller';
import type { TodoPlace } from '$lib/server/todos/saveTodo';

export const nobodyOwnsRefusal =
	'A to-do anyone can take hangs under a task: give its taskId as well as owner "nobody".';
const noSuchTask = 'Name a task you can reach with taskId. Call find_tasks on the project first.';
const ownerOffProject = 'That person is not on the task’s project. Call list_project_people.';
export const ownerNotAColleague =
	'You can put a to-do only on the list of someone you share a project or an organisation with. ' +
	'Call list_project_people for their email.';

/** Whose the new to-do is and which task it hangs under, or a sentence saying why it cannot be. */
export async function chooseTodoPlace(
	caller: McpCaller,
	input: Record<string, unknown>
): Promise<TodoPlace | string> {
	const taskId = readOptionalText(input, 'taskId');
	const owner = readOptionalText(input, 'owner');
	if (taskId === null) return placeOnOwnList(caller, owner);
	const task = await reachableTask(caller, taskId);
	if (task === null) return noSuchTask;
	const place = { projectId: task.projectId, taskId: task.id };
	if (owner === null) return { ...place, ownerAccountId: caller.accountId };
	if (isNobodyNamed(owner)) return { ...place, ownerAccountId: null };
	const people = await getPeopleOnProject(caller.supabase, task.projectId);
	const person = findProjectPerson(people, owner);
	if (person === null) return ownerOffProject;
	return { ...place, ownerAccountId: person.id };
}

/** A to-do with no task behind it goes on one person's own list: the caller's, or a colleague's. */
async function placeOnOwnList(caller: McpCaller, owner: string | null): Promise<TodoPlace | string> {
	if (isNobodyNamed(owner)) return nobodyOwnsRefusal;
	const ownList = { projectId: null, taskId: null };
	const isTheCaller = owner === null || owner === caller.accountId;
	if (isTheCaller) return { ...ownList, ownerAccountId: caller.accountId };
	const colleague = findProjectPerson(await getPeopleIWorkWith(caller.supabase, caller.accountId), owner);
	if (colleague === null) return ownerNotAColleague;
	return { ...ownList, ownerAccountId: colleague.id };
}
