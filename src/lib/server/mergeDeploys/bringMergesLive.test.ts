import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { bringMergesLive } from './bringMergesLive';
import type { CommitCheck } from './commitCheck';
import type { MergeDeploy } from './mergeDeploy';
import type { Project } from '$lib/server/projects/projectRecord';

const promotionCommit = 'a'.repeat(40);
const fixCommit = 'b'.repeat(40);

const board = vi.hoisted(() => ({
	merges: [] as MergeDeploy[],
	checks: [] as CommitCheck[],
	promotedTaskIds: new Set<string>(),
	live: [] as { taskId: string; liveAt: string; sentence: string }[],
	done: [] as string[]
}));

vi.mock('./readMergeDeploys', () => ({ readRecentMerges: async () => ({ merges: board.merges, checks: board.checks }) }));
vi.mock('./findPromotedTaskIds', () => ({ findPromotedTaskIds: async () => board.promotedTaskIds }));
vi.mock('./markTaskLive', () => ({
	markTaskLive: async (_supabase: unknown, taskId: string, _project: unknown, liveAt: string, sentence: string) =>
		void board.live.push({ taskId, liveAt, sentence })
}));
vi.mock('$lib/server/projects/updateTaskStatus', () => ({ updateTaskStatus: async (_supabase: unknown, taskId: string) => void board.done.push(taskId) }));
vi.mock('$lib/server/conversations/postMessage', () => ({ postMessage: async () => undefined }));

const updates = { update: () => ({ eq: async () => ({ error: null }) }) };
const supabase = { from: () => updates } as unknown as SupabaseClient;
const portal = { id: 'portal', ownerId: 'owner', defaultBranch: 'main' } as Project;

function merge(taskId: string, commitSha: string): MergeDeploy {
	const pullRequestUrl = 'https://github.com/example/portal/pull/41';
	return { id: `merge-${taskId}`, taskId, projectId: 'portal', commitSha, pullRequestUrl, mergedAt: '2026-11-18T21:54:00Z', liveAt: null };
}

function check(commitSha: string, checkName: string, state: CommitCheck['state']): CommitCheck {
	return { commitSha, checkName, state, runUrl: '' };
}

describe('bringing a promotion live once its deploy has finished', () => {
	beforeEach(() =>
		Object.assign(board, {
			merges: [merge('first', promotionCommit), merge('second', promotionCommit)],
			checks: [],
			promotedTaskIds: new Set(['first', 'second']),
			live: [],
			done: []
		})
	);

	it('keeps the promoted tasks off live while the site deploy still runs', async () => {
		board.checks = [check(promotionCommit, 'Run test suite', 'passed'), check(promotionCommit, 'Deploy static site', 'running')];
		expect(await bringMergesLive(supabase, portal)).toEqual([]);
		expect(board.live).toEqual([]);
	});

	it('marks every promoted task live at one moment once every deploy check has passed, and leaves their status alone', async () => {
		board.checks = [check(promotionCommit, 'Deploy static site', 'passed'), check(promotionCommit, 'Deploy API', 'passed')];
		await bringMergesLive(supabase, portal);
		expect(board.live.map((entry) => entry.taskId)).toEqual(['first', 'second']);
		expect(new Set(board.live.map((entry) => entry.liveAt)).size).toBe(1);
		expect(board.live[0].sentence).toContain('has finished and its checks passed');
		expect(board.done).toEqual([]);
	});

	it('still marks a task merged straight into the default branch done', async () => {
		board.merges = [merge('urgent', fixCommit)];
		board.promotedTaskIds = new Set();
		board.checks = [check(fixCommit, 'Deploy static site', 'passed')];
		await bringMergesLive(supabase, portal);
		expect(board.done).toEqual(['urgent']);
		expect(board.live).toEqual([]);
	});
});
