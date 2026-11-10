import type { SupabaseClient } from '@supabase/supabase-js';
import { recordPapersTable } from './getBoardroomRecordPapers';

/** Keeps a paper taken from the records; the table refuses any later change to it. */
export async function insertRecordPaper(supabase: SupabaseClient, columns: Record<string, unknown>): Promise<void> {
	const { error } = await supabase.from(recordPapersTable).insert(columns);
	if (error) throw error;
}
