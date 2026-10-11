import type { SupabaseClient } from '@supabase/supabase-js';
import { organisationDetailColumns } from './organisationRecord';
import type { OrganisationDetails } from '$lib/data/organisationRules';

export async function updateOrganisationDetails(
	supabase: SupabaseClient,
	organisationId: string,
	details: OrganisationDetails
): Promise<void> {
	const { error } = await supabase
		.from('organisations')
		.update(organisationDetailColumns(details))
		.eq('id', organisationId);
	if (error) throw error;
}
