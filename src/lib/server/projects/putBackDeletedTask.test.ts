import { describe, expect, it } from 'vitest';
import { putBackDeletedTask } from './putBackDeletedTask';
import type { SupabaseClient } from '@supabase/supabase-js';

function answering(answer: { data: unknown; error: unknown }): { supabase: SupabaseClient; calls: unknown[] } {
	const calls: unknown[] = [];
	const supabase = { rpc: async (...given: unknown[]) => (calls.push(given), answer) } as unknown as SupabaseClient;
	return { supabase, calls };
}

describe('putting a deleted task back', () => {
	it('asks the database to put the deletion back as the person, and answers with the id the task is back under', async () => {
		const { supabase, calls } = answering({ data: 'task', error: null });
		expect(await putBackDeletedTask(supabase, 'deletion', 'james')).toEqual({ taskId: 'task', refusal: null });
		const step = { target_deletion_id: 'deletion', putting_back_account_id: 'james' };
		expect(calls).toEqual([['put_back_deleted_task', step]]);
	});

	it('answers with the sentence the database refused with', async () => {
		const refused = { code: '23505', message: 'Task "Rods" was put back already, so nothing was put back again.' };
		const { supabase } = answering({ data: null, error: refused });
		expect(await putBackDeletedTask(supabase, 'deletion', 'james')).toEqual({ taskId: null, refusal: refused.message });
	});

	it('throws any other failure, which is not the person’s to read', async () => {
		const broken = { code: '42883', message: 'function does not exist' };
		const { supabase } = answering({ data: null, error: broken });
		await expect(putBackDeletedTask(supabase, 'deletion', 'james')).rejects.toBe(broken);
	});
});
