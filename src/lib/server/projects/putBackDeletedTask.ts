import type { SupabaseClient } from '@supabase/supabase-js';

/** What came of asking to put a deleted task back: the id it is back under, or why the database refused. */
export type PutBackOutcome = { taskId: string; refusal: null } | { taskId: null; refusal: string };

const putBackStep = 'put_back_deleted_task';

/** The codes the database refuses a put back with, each raised with a sentence saying why (migration 0244). */
const refusalCodes = ['P0002', '23503', '23505'];

/**
 * Puts one deleted task back from its record, whole, in one step of the database (migration 0244): the task with
 * the id it had, its history, and the links its deletion cleared. Attached files are not put back. The record
 * stays, marked as put back and by whom.
 */
export async function putBackDeletedTask(
	supabase: SupabaseClient,
	deletionId: string,
	puttingBackAccountId: string
): Promise<PutBackOutcome> {
	const step = { target_deletion_id: deletionId, putting_back_account_id: puttingBackAccountId };
	const { data, error } = await supabase.rpc(putBackStep, step);
	if (error === null) return { taskId: data as string, refusal: null };
	const isRefusal = refusalCodes.includes(error.code);
	if (!isRefusal) throw error;
	return { taskId: null, refusal: error.message };
}
