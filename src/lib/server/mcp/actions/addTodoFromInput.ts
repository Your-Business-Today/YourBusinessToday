import { addTodo } from '$lib/server/todos/saveTodo';
import { validateTodoChanges } from '$lib/data/validateTodo';
import { chooseTodoPlace } from './todoPlace';
import type { McpCaller } from '../resolveMcpCaller';
import type { Todo } from '$lib/server/todos/todoRecord';

/** Adds a to-do from add_todo's input, through every check add_todo makes, or says why it cannot. */
export async function addTodoFromInput(caller: McpCaller, input: Record<string, unknown>): Promise<Todo | string> {
	const changes = validateTodoChanges(input);
	if (typeof changes === 'string') return changes;
	if (changes.title === undefined) return 'A to-do needs a title.';
	const place = await chooseTodoPlace(caller, input);
	if (typeof place === 'string') return place;
	return addTodo(caller.supabase, place, { ...changes, title: changes.title }, caller.accountId);
}
