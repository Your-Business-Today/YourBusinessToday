import type { SupabaseClient } from '@supabase/supabase-js';
import { getOrganisations } from './getOrganisations';
import { getProjectsForOrganisation } from './getProjectsForOrganisation';
import type { Organisation } from './organisationRecord';

/** An organisation as the register lists it: how many businesses, projects and people are on it. */
export type OrganisationSummary = Organisation & {
	subOrganisationCount: number;
	projectCount: number;
	memberCount: number;
};

/** Every organisation the caller can see, counted up. */
export async function getOrganisationsWithCounts(supabase: SupabaseClient): Promise<OrganisationSummary[]> {
	const [organisations, projects, memberCounts] = await Promise.all([
		getOrganisations(supabase),
		getProjectsForOrganisation(supabase, null),
		getMemberCounts(supabase)
	]);
	return organisations.map((organisation) => ({
		...organisation,
		subOrganisationCount: organisations.filter((candidate) => candidate.parentOrganisationId === organisation.id).length,
		projectCount: projects.filter((project) => project.organisationId === organisation.id).length,
		memberCount: memberCounts.get(organisation.id) ?? 0
	}));
}

async function getMemberCounts(supabase: SupabaseClient): Promise<Map<string, number>> {
	const { data, error } = await supabase.from('organisation_members').select('organisation_id');
	if (error) throw error;
	const counts = new Map<string, number>();
	for (const row of data as Record<string, unknown>[]) {
		const organisationId = row.organisation_id as string;
		counts.set(organisationId, (counts.get(organisationId) ?? 0) + 1);
	}
	return counts;
}
