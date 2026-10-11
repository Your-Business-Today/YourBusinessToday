import type { SupabaseClient } from '@supabase/supabase-js';
import { nextRankOnBoard } from '$lib/server/projects/nextRanks';
import { syncOrganisationAccess } from '$lib/server/organisations/syncOrganisationAccess';

export type NewProjectSeed = {
	name: string;
	description: string;
	organisationId: string | null;
	ownerId: string;
	createdBy: string;
};

/** A project under an organisation is on its people's boards the moment it exists. */
export async function createProject(supabase: SupabaseClient, seed: NewProjectSeed): Promise<void> {
	const { error } = await supabase.from('projects').insert({
		name: seed.name,
		description: seed.description,
		organisation_id: seed.organisationId,
		priority: await nextRankOnBoard(supabase, seed.ownerId),
		owner_id: seed.ownerId,
		created_by: seed.createdBy
	});
	if (error) throw error;
	if (seed.organisationId !== null) await syncOrganisationAccess(seed.organisationId);
}
