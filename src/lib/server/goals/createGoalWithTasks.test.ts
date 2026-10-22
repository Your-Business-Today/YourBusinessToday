import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createGoal } from './createGoal';
import { createGoalWithTasks } from './createGoalWithTasks';
import { createTask, type NewTaskSeed } from '$lib/server/projects/createTask';
import { deleteGoal } from './deleteGoal';
import { deleteTask } from '$lib/server/projects/deleteTask';
import type { SupabaseClient } from '@supabase/supabase-js';

vi.mock('./createGoal', () => ({ createGoal: vi.fn() }));
vi.mock('./deleteGoal', () => ({ deleteGoal: vi.fn() }));
vi.mock('$lib/server/projects/createTask', () => ({ createTask: vi.fn() }));
vi.mock('$lib/server/projects/deleteTask', () => ({ deleteTask: vi.fn() }));

const supabase = {} as SupabaseClient;
const goal = { title: 'Get found online', measure: '', horizon: 'current' as const };
const seed = { title: 'FIX: the footer links to Admin', goalId: null } as NewTaskSeed;

describe('raising a goal with its tasks', () => {
	beforeEach(() => {
		vi.mocked(createGoal).mockResolvedValue('goal-1');
		vi.mocked(createTask).mockReset();
		vi.mocked(deleteTask).mockReset();
		vi.mocked(deleteGoal).mockReset();
	});

	it('raises every task under the new goal', async () => {
		vi.mocked(createTask).mockResolvedValueOnce('task-1').mockResolvedValueOnce('task-2');
		const raised = await createGoalWithTasks(supabase, 'project-1', goal, [seed, seed], 'me');
		expect(raised).toEqual({ goalId: 'goal-1', taskIds: ['task-1', 'task-2'] });
		const seedUnderGoal = expect.objectContaining({ goalId: 'goal-1' });
		expect(createTask).toHaveBeenCalledWith(supabase, 'project-1', seedUnderGoal, 'me');
	});

	it('deletes what it made when a task fails, so no goal is left without its tasks', async () => {
		vi.mocked(createTask).mockResolvedValueOnce('task-1').mockRejectedValueOnce(new Error('refused'));
		await expect(createGoalWithTasks(supabase, 'project-1', goal, [seed, seed], 'me')).rejects.toThrow();
		expect(deleteTask).toHaveBeenCalledWith(supabase, 'task-1');
		expect(deleteGoal).toHaveBeenCalledWith(supabase, 'goal-1');
	});
});
