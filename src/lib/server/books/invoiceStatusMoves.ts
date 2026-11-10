import type { SupabaseClient } from '@supabase/supabase-js';

/** Takes out of the ledger a journal that was posted for a move that did not happen; its lines go with it. */
export async function withdrawJournal(supabase: SupabaseClient, organisationId: string, journalId: string | null): Promise<void> {
	if (journalId === null) return;
	const { error } = await supabase.from('books_journals').delete().eq('organisation_id', organisationId).eq('id', journalId);
	if (error !== null) throw error;
}
