import type { SupabaseClient } from '@supabase/supabase-js';
import { parseOrganisationRecord, type Organisation } from './organisationRecord';

export async function getOrganisation(
	supabase: SupabaseClient,
	organisationId: string
): Promise<Organisation | null> {
	const { data, error } = await supabase
		.from('organisations')
		.select('*')
		.eq('id', organisationId)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return parseOrganisationRecord(data);
}
