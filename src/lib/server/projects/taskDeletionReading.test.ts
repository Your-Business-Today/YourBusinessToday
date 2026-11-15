import { describe, expect, it } from 'vitest';
import { findTaskDeletion } from './taskDeletionReading';
import type { SupabaseClient } from '@supabase/supabase-js';

const keptRow = {
	id: 'deletion',
	task_id: 'task',
	project_id: 'project',
	title: 'Catch sizes follow the stock',
	record: { status: 'done', parent_task_id: 'story' },
	deleted_by_account_id: null,
	deleted_at: '2026-11-14T21:34:00Z'
};

function holding(row: unknown): SupabaseClient {
	const query = { select: () => query, eq: () => query, maybeSingle: async () => ({ data: row, error: null }) };
	return { from: () => query } as unknown as SupabaseClient;
}

describe('reading the record of deleted tasks', () => {
	it('reads where the task stood and what it was under from its copy', async () => {
		const deletion = await findTaskDeletion(holding(keptRow), 'deletion');
		expect(deletion).toEqual(
			expect.objectContaining({ status: 'done', parentTaskId: 'story', deletedByAccountId: null })
		);
	});

	it('reads a task under nothing, in a status it no longer knows, as in the backlog with no parent', async () => {
		const deletion = await findTaskDeletion(holding({ ...keptRow, record: { status: 'archived' } }), 'deletion');
		expect(deletion).toEqual(expect.objectContaining({ status: 'backlog', parentTaskId: null }));
	});

	it('answers null when the record holds no such deletion', async () => {
		expect(await findTaskDeletion(holding(null), 'deletion')).toBeNull();
	});
});
