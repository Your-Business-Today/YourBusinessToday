import type { SupabaseClient } from '@supabase/supabase-js';
import { nextRankOnBoard } from '$lib/server/projects/nextRanks';
import { syncOrganisationAccess } from '$lib/server/organisations/syncOrganisationAccess';

export type NewProjectSeed = {
	name: string;
	description: string;
	organisationId: string | null;
	isStaffOnIt?: boolean;
	repositoryUrl?: string;
	ownerId: string;
	createdBy: string;
};

/**
 * A project under an organisation is on its people's boards the moment it exists; one every staff member is on
 * (a client's onboarding project) is on theirs as well.
 * One made with no repository is an internal project until a repository or a development task is added.
 */
export async function createProject(supabase: SupabaseClient, seed: NewProjectSeed): Promise<void> {
	const { error } = await supabase.from('projects').insert({
		name: seed.name,
		description: seed.description,
		organisation_id: seed.organisationId,
		repository_url: seed.repositoryUrl ?? '',
		priority: await nextRankOnBoard(supabase, seed.ownerId),
		owner_id: seed.ownerId,
		created_by: seed.createdBy,
		...staffColumns(seed.isStaffOnIt === true)
	});
	if (error) throw error;
	if (seed.organisationId !== null) await syncOrganisationAccess(seed.organisationId);
}

/** Only a project every staff member is on names the column the database brings the staff on by. */
function staffColumns(isStaffOnIt: boolean): Record<string, boolean> {
	if (!isStaffOnIt) return {};
	return { is_team_project: true };
}
