import { describe, expect, it, vi } from 'vitest';
import { readDeletedTasks } from './readDeletedTasks';
import type { SupabaseClient } from '@supabase/supabase-js';

const kept = vi.hoisted(() => ({
	deletion: (id: string, record: Record<string, unknown>, deletedByAccountId: string | null) => ({
		id,
		taskId: `task-${id}`,
		projectId: 'project',
		title: `Task ${id}`,
		status: 'done',
		parentTaskId: (record.parent_task_id as string | undefined) ?? null,
		attachedFilenames: ((record.task_attachments as unknown[] | undefined) ?? []).map(() => 'file.png'),
		record,
		deletedByAccountId,
		deletedAt: '2026-11-14T21:34:00Z',
		putBackAt: null
	})
}));

vi.mock('./taskDeletionReading', () => ({
	findTaskDeletions: async () => [
		kept.deletion('one', { parent_task_id: 'story', task_attachments: [{}, {}] }, 'james'),
		kept.deletion('two', { parent_task_id: 'gone' }, null),
		kept.deletion('three', {}, 'james')
	]
}));
vi.mock('./taskDeletionSurroundings', () => ({ findParentTitles: async () => new Map([['story', 'Fish are drawn']]) }));
vi.mock('$lib/server/accounts/getAccountsById', () => ({
	getAccountsById: async (_supabase: unknown, ids: string[]) => ids.map((id) => ({ id, name: 'James' }))
}));

describe('the deleted tasks the project page lists', () => {
	it('says what each was, what it was under, who deleted it, and how many files it had', async () => {
		const [one, two, three] = await readDeletedTasks({} as SupabaseClient, 'project');
		expect(one).toEqual(
			expect.objectContaining({ statusLabel: 'Done', parentTitle: 'Fish are drawn', deletedByName: 'James' })
		);
		expect(one.attachedFilenames).toEqual(['file.png', 'file.png']);
		expect(two).toEqual(
			expect.objectContaining({ parentTitle: 'a task no longer there', deletedByName: 'nobody the record names' })
		);
		expect(three).toEqual(expect.objectContaining({ parentTitle: null, attachedFilenames: [], putBackAt: null }));
	});
});
