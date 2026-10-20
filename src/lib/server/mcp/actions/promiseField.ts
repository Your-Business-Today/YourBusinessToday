import { createTask, type NewTaskSeed } from '$lib/server/projects/createTask';
import { setTaskAssignees } from '$lib/server/projects/setTaskAssignees';
import { taskKinds } from '$lib/data/taskKind';
import { readOptionalText, textField } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { ResolvedSubject } from './resolveSubject';

const isPromiseAutocomplete = false;

export const promiseField = textField(
	'Something the person you are with promises in this message ("I’ll do X"), in a few words ' +
		'that name the deed, such as "Make a £99 test booking and refund it in Stripe". It is ' +
		'raised as a subtask of this task assigned to them, so it shows in list_waiting_on_me ' +
		'until it is done. On a task only.'
);

export const promiseOnGoalRefusal =
	'A promise is raised as a subtask, so it goes on a task: post it on the task it serves.';

export function readPromise(input: Record<string, unknown>): string | null {
	return readOptionalText(input, 'promise');
}

/** Raises the promise as a subtask of the task it was made on, assigned to whoever made it. */
export async function raisePromise(
	caller: McpCaller,
	resolved: ResolvedSubject,
	promise: string
): Promise<string> {
	const { subject } = resolved;
	if (!('taskId' in subject)) return '';
	const seed: NewTaskSeed = {
		title: promise,
		details: `Promised in a message on "${resolved.title}".`,
		dueDate: null,
		parentTaskId: subject.taskId,
		waitsForTaskId: null,
		goalId: resolved.parentGoalId,
		kind: taskKinds.work,
		autocomplete: isPromiseAutocomplete
	};
	const taskId = await createTask(caller.supabase, resolved.projectId, seed, caller.accountId);
	await setTaskAssignees(caller.supabase, taskId, [caller.accountId]);
	return ` The promise "${promise}" is a subtask assigned to the person you are with (task id: ${taskId}).`;
}
