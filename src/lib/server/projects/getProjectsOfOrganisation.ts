import type { SupabaseClient } from '@supabase/supabase-js';

/** A project run for an organisation, and whether its client sees it on their portal. */
export type OrganisationProject = { id: string; name: string; isOnClientPortal: boolean };

/** The projects under an organisation, by name. */
export async function getProjectsOfOrganisation(
	supabase: SupabaseClient,
	organisationId: string
): Promise<OrganisationProject[]> {
	const { data, error } = await supabase
		.from('projects')
		.select('id, name, client_id')
		.eq('organisation_id', organisationId)
		.order('name');
	if (error) throw error;
	return data.map((row: Record<string, unknown>) => ({
		id: String(row.id),
		name: String(row.name),
		isOnClientPortal: row.client_id !== null
	}));
}
