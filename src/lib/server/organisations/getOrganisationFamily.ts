import type { SupabaseClient } from '@supabase/supabase-js';
import { parseOrganisationRecord, type Organisation } from './organisationRecord';

/** The organisation with its parent and sister businesses, or with its sub-organisations: the set reach flows through. */
export async function getOrganisationFamily(
	supabase: SupabaseClient,
	organisationId: string
): Promise<Organisation[]> {
	const topId = await topOrganisationIdOf(supabase, organisationId);
	if (topId === null) return [];
	const { data, error } = await supabase
		.from('organisations')
		.select('*')
		.or(`id.eq.${topId},parent_organisation_id.eq.${topId}`)
		.order('name');
	if (error) throw error;
	return data.map(parseOrganisationRecord);
}

async function topOrganisationIdOf(supabase: SupabaseClient, organisationId: string): Promise<string | null> {
	const { data, error } = await supabase
		.from('organisations')
		.select('id, parent_organisation_id')
		.eq('id', organisationId)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return (data.parent_organisation_id as string) ?? (data.id as string);
}
