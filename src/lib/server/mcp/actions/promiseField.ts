import { addTodo } from '$lib/server/todos/saveTodo';
import { validateTodoChanges } from '$lib/data/validateTodo';
import { readOptionalText, textField } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { ResolvedSubject } from './resolveSubject';

export const promiseField = textField(
	'Something the person you are with promises in this message ("I’ll do X"), in a few words ' +
		'that name the deed, such as "Make a £99 test booking and refund it in Stripe". It goes on ' +
		'their own to-do list, linked to this task, so it shows in list_waiting_on_me until it is ' +
		'done and never holds the task up. On a task only.'
);

export const promiseOnGoalRefusal =
	'A promise becomes a to-do linked to the task it serves, so it goes on a task: post it there.';

export function readPromise(input: Record<string, unknown>): string | null {
	return readOptionalText(input, 'promise');
}

/** The promise as a refusal naming what does not fit a to-do, or null when it fits. */
export function promiseRefusal(promise: string | null): string | null {
	if (promise === null) return null;
	const checked = validateTodoChanges({ title: promise });
	return typeof checked === 'string' ? `The promise is a to-do's title: ${checked}` : null;
}

/** Puts the promise on the promiser's own to-do list, linked to the task it was made on. */
export async function raisePromise(
	caller: McpCaller,
	resolved: ResolvedSubject,
	promise: string
): Promise<string> {
	const { subject } = resolved;
	if (!('taskId' in subject)) return '';
	const place = { ownerAccountId: caller.accountId, projectId: resolved.projectId, taskId: subject.taskId };
	const todo = await addTodo(caller.supabase, place, { title: promise }, caller.accountId);
	return ` The promise "${promise}" is on the to-do list of the person you are with (to-do id: ${todo.id}).`;
}
