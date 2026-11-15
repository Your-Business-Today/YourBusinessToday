import { beforeEach, describe, expect, it, vi } from 'vitest';
import { raiseConflictTaskOnce } from './raiseConflictTask';
import { conflictTaskTitle } from './promotionConflict';
import { deployWindowOutcomes } from '$lib/data/deployWindow';
import { taskStatuses, type TaskStatus } from '$lib/data/taskStatus';
import type { Promotion } from './promoteStaging';
import type { NewTaskSeed } from '$lib/server/projects/createTask';
import type { Project } from '$lib/server/projects/projectRecord';
import type { ProjectTask } from '$lib/server/projects/taskRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

type RaisedTask = { projectId: string; seed: NewTaskSeed; createdBy: string };

const board = vi.hoisted(() => ({ raised: [] as RaisedTask[] }));

vi.mock('$lib/server/projects/createTask', () => ({
	createTask: async (_supabase: unknown, projectId: string, seed: NewTaskSeed, createdBy: string) => {
		board.raised.push({ projectId, seed, createdBy });
		return 'task-1';
	}
}));

const supabase = {} as SupabaseClient;
const portal = { id: 'project-1', ownerId: 'owner-1', defaultBranch: 'main', repositoryUrl: 'https://github.com/example/portal' } as Project;
const promotionUrl = 'https://github.com/example/portal/pull/12';
const conflicting: Promotion = { outcome: deployWindowOutcomes.failed, pullRequestUrl: promotionUrl, note: '', summary: '', hasConflict: true };
const opened: Promotion = { ...conflicting, outcome: deployWindowOutcomes.opened, hasConflict: false };

function conflictTaskThatIs(status: TaskStatus): ProjectTask {
	return { title: conflictTaskTitle(portal), status } as ProjectTask;
}

describe('raising the task that puts a conflicting promotion right', () => {
	beforeEach(() => {
		board.raised = [];
	});

	it('raises it on the project in the owner’s name, unsorted into a goal, with the pull request in its details', async () => {
		expect(await raiseConflictTaskOnce(supabase, portal, conflicting, [])).toBe('task-1');
		const [{ projectId, seed, createdBy }] = board.raised;
		expect({ projectId, createdBy }).toEqual({ projectId: 'project-1', createdBy: 'owner-1' });
		expect(seed).toMatchObject({ title: 'FIX: staging conflicts with main in portal, so nothing deploys', goalId: null });
		expect(seed.details).toContain(promotionUrl);
	});

	it('raises nothing while the earlier one is still open, so every hourly try does not raise another', async () => {
		const tasks = [conflictTaskThatIs(taskStatuses.inProgress)];
		expect(await raiseConflictTaskOnce(supabase, portal, conflicting, tasks)).toBeNull();
		expect(board.raised).toEqual([]);
	});

	it('raises it again when the earlier one is done and the conflict is back', async () => {
		const tasks = [conflictTaskThatIs(taskStatuses.done)];
		expect(await raiseConflictTaskOnce(supabase, portal, conflicting, tasks)).toBe('task-1');
		expect(board.raised).toHaveLength(1);
	});

	it('raises nothing for a promotion that does not conflict', async () => {
		expect(await raiseConflictTaskOnce(supabase, portal, opened, [])).toBeNull();
		expect(board.raised).toEqual([]);
	});
});
