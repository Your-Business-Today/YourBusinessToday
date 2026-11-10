import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeRaisedAction } from './makeRaisedAction';
import { calledMeeting } from '$lib/data/boardroomMeeting.fixtures';
import { accountsProjectId, fileTheAccounts, tellTheBank } from '$lib/data/boardroomAction.fixtures';
import type { BoardAction } from '$lib/data/boardroomAction';

const board = vi.hoisted(() => ({ tasks: [] as unknown[], assigned: [] as unknown[], todos: [] as Record<string, unknown>[], todoError: null as unknown }));
vi.mock('$lib/server/projects/createTask', () => ({
	createTask: async (_supabase: unknown, projectId: string, seed: unknown) => board.tasks.push({ projectId, seed })
}));
vi.mock('$lib/server/projects/setTaskAssignees', () => ({
	setTaskAssignees: async (_supabase: unknown, taskId: string, owners: string[]) => board.assigned.push({ taskId, owners })
}));

const supabase = {
	from: () => ({
		insert: async (row: Record<string, unknown>) => {
			if (board.todoError === null) board.todos.push(row);
			return { error: board.todoError };
		}
	})
};
const occasion = { meeting: calledMeeting, organisationName: 'Your Business Today', raisedBy: 'nigel' };
const decided = { itemNumber: 1, itemTitle: 'Item 1', decisionId: 'the-decision', wording: 'Approve the accounts.' };

function make(action: BoardAction, madeId: string) {
	return makeRaisedAction(supabase as never, occasion, { carried: { action, ...decided }, madeId });
}

describe('an action raised becomes a task on its project or a to-do on its owner’s list', () => {
	beforeEach(() => {
		board.tasks = [];
		board.assigned = [];
		board.todos = [];
		board.todoError = null;
	});

	it('makes a task in its department with the id its raising holds, and assigns it to its owner', async () => {
		await make(fileTheAccounts, 'made-task');
		expect(board.tasks).toMatchObject([{ projectId: accountsProjectId, seed: { id: 'made-task', title: fileTheAccounts.what, department: 'administration', dueDate: '2026-11-30', autocomplete: false } }]);
		expect(board.assigned).toEqual([{ taskId: 'made-task', owners: ['jeremy'] }]);
	});

	it('puts an action with no project on its owner’s own to-do list, naming the meeting and the decision', async () => {
		await make(tellTheBank, 'made-todo');
		expect(board.todos).toMatchObject([{ id: 'made-todo', owner_account_id: 'nigel', title: tellTheBank.what, created_by: 'nigel' }]);
		expect(String(board.todos[0].notes)).toContain('decision the-decision');
		expect(String(board.todos[0].notes)).toContain(calledMeeting.id);
	});

	it('leaves one already made with that id as it is, and lets any other failure be told', async () => {
		board.todoError = { code: '23505' };
		await expect(make(tellTheBank, 'made-todo')).resolves.toBeUndefined();
		board.todoError = { code: '42501', message: 'refused' };
		await expect(make(tellTheBank, 'made-todo')).rejects.toMatchObject({ code: '42501' });
	});
});
