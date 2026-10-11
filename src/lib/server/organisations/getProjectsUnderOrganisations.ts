import type { SupabaseClient } from '@supabase/supabase-js';
import type { ProjectPlace } from '$lib/data/organisationAccess';

/** Every project under any of the organisations, as the access rules read a project. */
export async function getProjectsUnderOrganisations(
	supabase: SupabaseClient,
	organisationIds: string[]
): Promise<ProjectPlace[]> {
	if (organisationIds.length === 0) return [];
	const { data, error } = await supabase
		.from('projects')
		.select('id, owner_id, organisation_id')
		.in('organisation_id', organisationIds);
	if (error) throw error;
	return data.map((row: Record<string, unknown>) => ({
		id: row.id as string,
		ownerId: row.owner_id as string,
		organisationId: (row.organisation_id as string) ?? null
	}));
}
