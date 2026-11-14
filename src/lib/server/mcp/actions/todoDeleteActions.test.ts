import { describe, expect, it, vi } from 'vitest';
import { todoDeleteActions } from './todoDeleteActions';
import { todoDeletionRefused } from '$lib/server/todos/todoDeletion';
import type { McpCaller } from '../resolveMcpCaller';

const deleted = vi.hoisted(() => ({ isDeleted: true }));

vi.mock('./todoAccess', () => ({
	noSuchTodo: 'No such to-do.',
	reachableTodo: async (_caller: unknown, input: Record<string, unknown>) =>
		input.todoId === 'door-code' ? { id: 'door-code', title: 'Enter the door code', status: 'to_do' } : null
}));
vi.mock('$lib/server/todos/saveTodo', () => ({ deleteTodo: async () => deleted.isDeleted }));
vi.mock('./describeTodos', () => ({ todoLine: (todo: { title: string }) => todo.title }));

const caller = { accountId: 'james', supabase: {} } as unknown as McpCaller;
const [deleteTodoAction] = todoDeleteActions;

describe('deleting a to-do through the connector', () => {
	it('deletes a to-do the caller may delete', async () => {
		deleted.isDeleted = true;
		expect(await deleteTodoAction.run(caller, { todoId: 'door-code' })).toBe('Deleted:\nEnter the door code');
	});

	it('refuses a to-do the caller cannot reach, and one only its owner or raiser may delete', async () => {
		expect(await deleteTodoAction.run(caller, { todoId: 'stranger' })).toBe('No such to-do.');
		deleted.isDeleted = false;
		expect(await deleteTodoAction.run(caller, { todoId: 'door-code' })).toBe(todoDeletionRefused);
	});
});
