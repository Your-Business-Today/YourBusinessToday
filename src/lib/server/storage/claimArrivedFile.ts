import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Marks the row of a file that has arrived as recorded, at the size that arrived: one conditional
 * update, so two callers cannot both record the same file. False when it was recorded already.
 */
export async function claimArrivedFile(
	supabase: SupabaseClient,
	table: string,
	rowId: string,
	byteCount: number,
	now: Date = new Date()
): Promise<boolean> {
	const { data, error } = await supabase
		.from(table)
		.update({ recorded_at: now.toISOString(), byte_count: byteCount })
		.eq('id', rowId)
		.is('recorded_at', null)
		.select('id');
	if (error) throw error;
	return data.length > 0;
}
