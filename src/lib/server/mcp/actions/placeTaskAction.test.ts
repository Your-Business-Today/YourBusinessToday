import { beforeEach, describe, expect, it, vi } from 'vitest';
import { placeTaskAction } from './placeTaskAction';
import type { McpCaller } from '../resolveMcpCaller';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

const { board, placements } = vi.hoisted(() => ({
	board: new Map<string, ProjectTask>(),
	placements: [] as unknown[][]
}));

const goalTitles: Record<string, string> = { accounts: 'Accounts', apps: 'Apps' };
vi.mock('$lib/server/projects/getTask', () => ({
	getTask: async (_supabase: unknown, taskId: string) => board.get(taskId) ?? null
}));
vi.mock('$lib/server/goals/getGoal', () => ({
	getGoal: async (_supabase: unknown, goalId: string) => ({ id: goalId, title: goalTitles[goalId] })
}));
vi.mock('$lib/server/projects/updateTaskGoal', () => ({
	updateTaskGoal: async (_supabase: unknown, taskId: string, goalId: string | null) => {
		board.set(taskId, { ...board.get(taskId)!, goalId });
	}
}));
vi.mock('$lib/server/projects/reparentTask', () => ({
	reparentTask: async (_supabase: unknown, taskId: string, parentTaskId: string | null) => {
		const movedTask = board.get(taskId)!;
		if (parentTaskId !== taskId) board.set(taskId, { ...movedTask, parentTaskId });
	}
}));
vi.mock('$lib/server/ordering/rankedScope', () => ({
	placeBeside: async (...placement: unknown[]) => placements.push(placement) > 0
}));
vi.mock('$lib/server/projects/taskSiblings', () => ({ siblingsOf: () => ({}) }));

function task(id: string, title: string, goalId: string | null, parentTaskId: string | null = null) {
	return { id, title, goalId, parentTaskId, projectId: 'ybt' } as ProjectTask;
}

const owner = { ownedProjectIds: ['ybt'], memberProjectIds: [], supabase: {} } as unknown as McpCaller;
function place(extraInput: Record<string, unknown> = {}) {
	const input = { taskId: 'ledger', targetTaskId: 'store', placement: 'after', ...extraInput };
	return placeTaskAction.run(owner, input);
}

describe('place_task', () => {
	beforeEach(() => {
		board.clear();
		board.set('ledger', task('ledger', 'Bring the ledger across', 'accounts'));
		board.set('store', task('store', 'Complete the App Store Connect setup', 'apps'));
		board.set('release', task('release', 'Ship the release', 'apps'));
		board.set('notes', task('notes', 'Write the release notes', null, 'release'));
		board.set('entries', task('entries', 'Check the entries', null, 'ledger'));
		placements.length = 0;
	});

	it('keeps the task’s goal when it is placed beside a task under another goal', async () => {
		const answer = await place();
		expect(board.get('ledger')!.goalId).toBe('accounts');
		expect(placements).toEqual([[{}, 'ledger', 'store', 'after']]);
		expect(answer).toBe(
			'"Bring the ledger across" now sits after "Complete the App Store Connect setup".\n' +
				'Its goal stays "Accounts"; the task it sits beside is under "Apps". ' +
				'Pass shouldJoinTargetGoal true to move it there as well.'
		);
	});

	it('moves the task into the target’s goal when asked, and says from which to which', async () => {
		const answer = await place({ shouldJoinTargetGoal: true });
		expect(board.get('ledger')!.goalId).toBe('apps');
		expect(answer).toBe(
			'"Bring the ledger across" now sits after "Complete the App Store Connect setup".\n' +
				'Its goal changed from "Accounts" to "Apps".'
		);
	});

	it('says when the task joins another parent to be ordered among its subtasks', async () => {
		const answer = await place({ targetTaskId: 'notes', placement: 'before' });
		expect(board.get('ledger')!.parentTaskId).toBe('release');
		expect(board.get('ledger')!.goalId).toBe('accounts');
		expect(answer).toContain('It left the top level and is now a subtask of "Ship the release"');
	});

	it('refuses to join a goal beside a subtask, or to sit beside itself', async () => {
		const joinBesideSubtask = await place({ targetTaskId: 'notes', shouldJoinTargetGoal: true });
		expect(joinBesideSubtask).toContain('a subtask counts toward its parent’s goal');
		expect(await place({ targetTaskId: 'ledger' })).toBe('A task cannot be placed beside itself.');
		expect(placements).toEqual([]);
		expect(board.get('ledger')!.goalId).toBe('accounts');
	});

	it('changes nothing when the task would sit under itself', async () => {
		const answer = await place({ targetTaskId: 'entries', shouldJoinTargetGoal: false });
		expect(answer).toContain('was not moved');
		expect(placements).toEqual([]);
	});
});
