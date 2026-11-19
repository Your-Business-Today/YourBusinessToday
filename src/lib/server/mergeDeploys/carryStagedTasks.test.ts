import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { carryStagedTasks } from './carryStagedTasks';
import type { PullRequestEvent } from '$lib/server/deploys/readPullRequestEvent';
import type { Project } from '$lib/server/projects/projectRecord';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

const board = vi.hoisted(() => ({
	stagedTasks: [] as { id: string }[],
	hasChecksOnMain: true,
	said: [] as string[],
	awaited: [] as string[],
	liveAtOnce: [] as string[],
	liveAfterChecks: 0
}));

vi.mock('$lib/server/projects/findStagedTasks', () => ({ findStagedTasks: async () => board.stagedTasks }));
vi.mock('$lib/server/conversations/postMessage', () => ({
	postMessage: async (_supabase: unknown, _place: unknown, _author: unknown, sentence: string) => void board.said.push(sentence)
}));
vi.mock('./awaitMergeDeploy', () => ({
	awaitMergeDeploy: async (_supabase: unknown, taskId: string) => {
		if (board.hasChecksOnMain) board.awaited.push(taskId);
		return board.hasChecksOnMain;
	}
}));
vi.mock('./bringMergesLive', () => ({ bringMergesLive: async () => void board.liveAfterChecks++ }));
vi.mock('./bringStagedLive', () => ({
	bringStagedLive: async (_supabase: unknown, _project: unknown, _url: string, tasks: ProjectTask[]) => {
		board.liveAtOnce.push(...tasks.map((task) => task.id));
		return tasks.map((task) => task.id);
	}
}));

const supabase = {} as SupabaseClient;
const portal = { id: 'portal', ownerId: 'owner', defaultBranch: 'main' } as Project;
const promotion = { url: 'https://github.com/example/portal/pull/41', mergeCommitSha: 'a'.repeat(40) } as PullRequestEvent;

describe('carrying the staged tasks when staging is promoted', () => {
	beforeEach(() =>
		Object.assign(board, { stagedTasks: [{ id: 'first' }, { id: 'second' }], hasChecksOnMain: true, said: [], awaited: [], liveAtOnce: [], liveAfterChecks: 0 })
	);

	it('leaves every task waiting on the deploy checks, not live, when checks report on the default branch', async () => {
		const carried = await carryStagedTasks(supabase, portal, promotion);
		expect(carried).toEqual(['first', 'second']);
		expect(board.awaited).toEqual(['first', 'second']);
		expect(board.liveAtOnce).toEqual([]);
		expect(board.said).toHaveLength(2);
		expect(board.said[0]).toContain('live once the deploy');
		expect(board.liveAfterChecks).toBe(1);
	});

	it('marks every task live at the merge when no checks report on the default branch', async () => {
		board.hasChecksOnMain = false;
		await carryStagedTasks(supabase, portal, promotion);
		expect(board.liveAtOnce).toEqual(['first', 'second']);
		expect(board.said).toEqual([]);
	});

	it('does nothing when nothing was staged', async () => {
		board.stagedTasks = [];
		expect(await carryStagedTasks(supabase, portal, promotion)).toEqual([]);
		expect(board.liveAfterChecks).toBe(0);
	});
});
