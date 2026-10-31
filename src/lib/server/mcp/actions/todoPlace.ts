import { findProjectPerson } from '$lib/server/members/findProjectPerson';
import { getPeopleOnProject } from '$lib/server/members/getPeopleOnProject';
import { isNobodyNamed } from '$lib/data/batonRule';
import { readOptionalText } from '../actionTypes';
import { reachableTask } from '../projectAccess';
import type { McpCaller } from '../resolveMcpCaller';
import type { TodoPlace } from '$lib/server/todos/saveTodo';

export const nobodyOwnsRefusal =
	'A to-do anyone can take hangs under a task: give its taskId as well as owner "nobody".';
const noSuchTask = 'Name a task you can reach with taskId. Call find_tasks on the project first.';
const ownerOffProject = 'That person is not on the task’s project. Call list_project_people.';
const ownerWithoutTask =
	'Someone else’s to-do is linked to the task it serves: give its taskId as well.';

/** Whose the new to-do is and which task it hangs under, or a sentence saying why it cannot be. */
export async function chooseTodoPlace(
	caller: McpCaller,
	input: Record<string, unknown>
): Promise<TodoPlace | string> {
	const taskId = readOptionalText(input, 'taskId');
	const owner = readOptionalText(input, 'owner');
	if (taskId === null) return placeWithoutTask(caller, owner);
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

function placeWithoutTask(caller: McpCaller, owner: string | null): TodoPlace | string {
	if (isNobodyNamed(owner)) return nobodyOwnsRefusal;
	const isSomeoneElse = owner !== null && owner !== caller.accountId;
	if (isSomeoneElse) return ownerWithoutTask;
	return { ownerAccountId: caller.accountId, projectId: null, taskId: null };
}
