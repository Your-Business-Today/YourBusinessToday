import type { SupabaseClient } from '@supabase/supabase-js';
import { invoicesTable } from './invoiceRecord';

/** The journal that posted the invoice's sale when it was issued, or null when it has posted none. */
export async function findIssuedJournalId(supabase: SupabaseClient, organisationId: string, invoiceId: string): Promise<string | null> {
	const { data, error } = await supabase
		.from(invoicesTable)
		.select('issued_journal_id')
		.eq('organisation_id', organisationId)
		.eq('id', invoiceId)
		.maybeSingle();
	if (error !== null) throw error;
	const held = data as { issued_journal_id: string | null } | null;
	return held?.issued_journal_id ?? null;
}
