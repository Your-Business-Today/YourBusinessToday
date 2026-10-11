import type { SupabaseClient } from '@supabase/supabase-js';
import { parseProjectStatus, type ProjectStatus } from '$lib/data/projectStatus';

/** A project as an organisation lists it: under which of its businesses, and how far along. */
export type OrganisationProject = {
	id: string;
	name: string;
	status: ProjectStatus;
	ownerId: string;
	organisationId: string;
	organisationName: string;
};

/** The projects under an organisation and its sub-organisations — or, with no organisation named, under every one the caller reaches. */
export async function getProjectsForOrganisation(
	supabase: SupabaseClient,
	organisationId: string | null
): Promise<OrganisationProject[]> {
	const { data, error } = await supabase.rpc('organisation_projects', { organisation: organisationId });
	if (error) throw error;
	return data.map(parseOrganisationProject);
}

function parseOrganisationProject(row: Record<string, unknown>): OrganisationProject {
	return {
		id: row.id as string,
		name: row.name as string,
		status: parseProjectStatus(row.status),
		ownerId: row.owner_id as string,
		organisationId: row.organisation_id as string,
		organisationName: row.organisation_name as string
	};
}
