import type { SupabaseClient } from '@supabase/supabase-js';
import { getReachableProjectIds } from '$lib/server/projects/getReachableProjectIds';
import type { OrganisationProject } from './getProjectsForOrganisation';

/** A project as an organisation lists it to one viewer: one they are on opens; one they are not on is only named. */
export type ReachableOrganisationProject = OrganisationProject & { isReachable: boolean };

/** Marks each project with whether the viewer owns it or is on it, which is what lets its page open. */
export async function markReachableProjects(
	supabase: SupabaseClient,
	viewerId: string,
	projects: OrganisationProject[]
): Promise<ReachableOrganisationProject[]> {
	const reachableIds = new Set(await getReachableProjectIds(supabase, viewerId));
	return projects.map((project) => ({ ...project, isReachable: reachableIds.has(project.id) }));
}
