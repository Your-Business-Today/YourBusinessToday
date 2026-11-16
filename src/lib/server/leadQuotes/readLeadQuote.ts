import type { SupabaseClient } from '@supabase/supabase-js';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { parseLeadQuote, type LeadQuoteRow } from './parseLeadQuote';
import type { LeadQuote, LeadQuoteVersion } from '$lib/data/leadQuoteRules';

const quoteColumns =
	'id, version, title, introduction, terms, prepared_on, valid_until, filed_at, ' +
	'lead_quote_lines (position, name, delivers, timing, fee_basis, fee_amount, fee_note)';

/** A company's quote: the version named, or the latest when none is; null when none is filed or the tables are not there yet. */
export async function readLeadQuote(supabase: SupabaseClient, clientId: string, version: number | null = null): Promise<LeadQuote | null> {
	const query = supabase.from('lead_quotes').select(quoteColumns).eq('client_id', clientId);
	const chosen = version === null ? query.order('version', { ascending: false }) : query.eq('version', version);
	const { data, error } = await chosen.limit(1).maybeSingle();
	if (isSchemaNotYetMigrated(error)) return null;
	if (error) throw error;
	if (data === null) return null;
	return parseLeadQuote(data as unknown as LeadQuoteRow);
}

/** Every version of a company's quote filed so far, the latest first. */
export async function listLeadQuoteVersions(supabase: SupabaseClient, clientId: string): Promise<LeadQuoteVersion[]> {
	const { data, error } = await supabase
		.from('lead_quotes')
		.select('version, title, filed_at')
		.eq('client_id', clientId)
		.order('version', { ascending: false });
	if (isSchemaNotYetMigrated(error)) return [];
	if (error) throw error;
	return (data ?? []).map((row) => ({ version: row.version as number, title: row.title as string, filedAt: row.filed_at as string }));
}
