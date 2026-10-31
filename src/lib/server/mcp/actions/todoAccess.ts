import { getTodo } from '$lib/server/todos/getTodos';
import { readOptionalText } from '../actionTypes';
import { canReachProject } from '../projectAccess';
import type { McpCaller } from '../resolveMcpCaller';
import type { Todo } from '$lib/server/todos/todoRecord';

export const noSuchTodo = 'Name a to-do of yours, or one on a project you are on: call list_my_todos.';

/** The to-do named by todoId, when it is the caller's, they raised it, or it is on a project they are on. */
export async function reachableTodo(
	caller: McpCaller,
	input: Record<string, unknown>
): Promise<Todo | null> {
	const todoId = readOptionalText(input, 'todoId');
	if (todoId === null) return null;
	const todo = await getTodo(caller.supabase, todoId);
	if (todo === null) return null;
	const isTheirs = todo.ownerAccountId === caller.accountId || todo.createdBy === caller.accountId;
	const isOnTheirProject = todo.projectId !== null && canReachProject(caller, todo.projectId);
	return isTheirs || isOnTheirProject ? todo : null;
}
