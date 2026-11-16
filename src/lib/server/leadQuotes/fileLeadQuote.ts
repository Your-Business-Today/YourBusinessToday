import type { SupabaseClient } from '@supabase/supabase-js';
import type { LeadQuoteFiled } from '$lib/data/leadQuoteRules';

/** Files a checked quote as the next numbered version for its company, whole, and says which number it took. */
export async function fileLeadQuote(supabase: SupabaseClient, quote: LeadQuoteFiled, filedByAccountId: string): Promise<number> {
	const { clientId, ...filing } = quote;
	const { data, error } = await supabase.rpc('file_lead_quote', {
		target_client: clientId,
		filer: filedByAccountId,
		quote: filing
	});
	if (error) throw error;
	return Number(data);
}
