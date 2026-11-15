import { deleteTodo } from '$lib/server/todos/saveTodo';
import { todoDeletionRefused } from '$lib/server/todos/todoDeletion';
import { todoIdField } from '$lib/server/todos/todoConnectorFields';
import { objectSchema } from '../actionTypes';
import { noSuchTodo, reachableTodo } from './todoAccess';
import { todoLine } from './describeTodos';
import type { McpAction } from '../actionTypes';

export const todoDeleteActions: McpAction[] = [
	{
		name: 'delete_todo',
		area: 'tasks',
		audience: 'everyone',
		isWrite: true,
		summary: 'delete a to-do that was raised by mistake or is no longer needed',
		guidance:
			'Delete a to-do only when the person says it should not exist: raised by mistake, a ' +
			'duplicate, or no longer wanted. A job that was done is ticked off with complete_todo ' +
			'instead, so it stays on the record. Only its owner or whoever raised it can delete it.',
		inputSchema: objectSchema({ todoId: todoIdField }, ['todoId']),
		run: async (caller, input) => {
			const todo = await reachableTodo(caller, input);
			if (todo === null) return noSuchTodo;
			const isDeleted = await deleteTodo(caller.supabase, todo.id);
			if (!isDeleted) return todoDeletionRefused;
			return `Deleted:\n${todoLine(todo)}`;
		}
	}
];
