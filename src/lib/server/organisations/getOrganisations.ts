import type { SupabaseClient } from '@supabase/supabase-js';
import { parseOrganisationRecord, type Organisation } from './organisationRecord';

/** Every organisation the client can see — the ones the person is on, or all of them for staff and the service role. */
export async function getOrganisations(supabase: SupabaseClient): Promise<Organisation[]> {
	const { data, error } = await supabase.from('organisations').select('*').order('name');
	if (error) throw error;
	return data.map(parseOrganisationRecord);
}
