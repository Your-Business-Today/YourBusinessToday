import type { SupabaseClient } from '@supabase/supabase-js';
import { syncOrganisationAccess } from './syncOrganisationAccess';

/** Moves a project under an organisation, or out from under one, and brings the people on each side up to date. */
export async function setProjectOrganisation(
	supabase: SupabaseClient,
	projectId: string,
	organisationId: string | null,
	previousOrganisationId: string | null
): Promise<void> {
	const { error } = await supabase
		.from('projects')
		.update({ organisation_id: organisationId })
		.eq('id', projectId);
	if (error) throw error;
	for (const touched of new Set([previousOrganisationId, organisationId])) {
		if (touched !== null) await syncOrganisationAccess(touched);
	}
}
