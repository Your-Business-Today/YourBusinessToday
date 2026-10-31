import { addTodo, updateTodo } from '$lib/server/todos/saveTodo';
import { todoStatuses } from '$lib/data/todo';
import { validateTodoChanges } from '$lib/data/validateTodo';
import { objectSchema, textField } from '../actionTypes';
import { chooseTodoPlace } from './todoPlace';
import { noSuchTodo, reachableTodo } from './todoAccess';
import { todoFields, todoIdField, todoPlaceFields } from '$lib/server/todos/todoConnectorFields';
import { todoLine } from './describeTodos';
import type { McpAction } from '../actionTypes';

const todoGuidance =
	'A to-do is a personal job on a person’s own list: one that belongs to no project. A job ' +
	'done for a project — insurance, an account, a listing — is a task in its department ' +
	'(create_task with department), assigned to them, so other tasks can wait for it. What a ' +
	'person has to give before a build can go on is an ask instead (post_message with waitingOn).';

const takeItField = textField('"yes" to make a to-do nobody has taken yet yours');

export const todoWriteActions: McpAction[] = [
	{
		name: 'add_todo',
		area: 'tasks',
		audience: 'everyone',
		isWrite: true,
		summary: 'put a to-do on someone’s own list, or under a task for anyone to take',
		guidance: todoGuidance,
		inputSchema: objectSchema({ ...todoFields, ...todoPlaceFields }, ['title']),
		run: async (caller, input) => {
			const changes = validateTodoChanges(input);
			if (typeof changes === 'string') return changes;
			if (changes.title === undefined) return 'A to-do needs a title.';
			const place = await chooseTodoPlace(caller, input);
			if (typeof place === 'string') return place;
			const todo = await addTodo(caller.supabase, place, { ...changes, title: changes.title }, caller.accountId);
			return `Added:\n${todoLine(todo)}`;
		}
	},
	{
		name: 'update_todo',
		area: 'tasks',
		audience: 'everyone',
		isWrite: true,
		summary: 'change a to-do’s title, notes, status or due date, or take one nobody has yet',
		guidance: `${todoGuidance} Give only the fields that change.`,
		inputSchema: objectSchema({ todoId: todoIdField, ...todoFields, takeIt: takeItField }, ['todoId']),
		run: async (caller, input) => {
			const todo = await reachableTodo(caller, input);
			if (todo === null) return noSuchTodo;
			const changes = validateTodoChanges(withoutIds(input));
			if (typeof changes === 'string') return changes;
			const isTaking = input.takeIt !== undefined && todo.ownerAccountId === null;
			const owner = isTaking ? { ownerAccountId: caller.accountId } : {};
			const saved = await updateTodo(caller.supabase, todo.id, { ...changes, ...owner });
			return `Saved:\n${todoLine(saved)}`;
		}
	},
	{
		name: 'complete_todo',
		area: 'tasks',
		audience: 'everyone',
		isWrite: true,
		summary: 'tick a to-do off as done',
		guidance: 'Tick a to-do off when the person says it is done. The task it serves is unaffected.',
		inputSchema: objectSchema({ todoId: todoIdField }, ['todoId']),
		run: async (caller, input) => {
			const todo = await reachableTodo(caller, input);
			if (todo === null) return noSuchTodo;
			const saved = await updateTodo(caller.supabase, todo.id, { status: todoStatuses.done });
			return `Done:\n${todoLine(saved)}`;
		}
	}
];

function withoutIds(input: Record<string, unknown>): Record<string, unknown> {
	const { todoId: _todoId, takeIt: _takeIt, ...fields } = input;
	return fields;
}
