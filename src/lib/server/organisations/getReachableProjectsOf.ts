import { getProjectsForOrganisation, type OrganisationProject } from './getProjectsForOrganisation';
import { markReachableProjects } from './markReachableProjects';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The organisation's projects the viewer can open: the ones they own or are on. */
export async function getReachableProjectsOf(
	supabase: SupabaseClient,
	viewerId: string,
	organisationId: string
): Promise<OrganisationProject[]> {
	const projects = await getProjectsForOrganisation(supabase, organisationId);
	const marked = await markReachableProjects(supabase, viewerId, projects);
	return marked.filter((project) => project.isReachable);
}
