import type { SupabaseClient } from '@supabase/supabase-js';
import { getReachableProjectIds } from '$lib/server/projects/getReachableProjectIds';
import { markReachable, type ReachableOrganisationProject } from './markReachableProjects';
import { orderByRankedIds } from '$lib/data/orderByRankedIds';
import type { OrganisationProject } from './getProjectsForOrganisation';

/**
 * An organisation's projects as one viewer lists them: marked with whether each opens for them, and in the order of
 * their own projects board, their own projects first; the ones they are not on come last, by name.
 */
export async function getProjectsInViewerOrder(
	supabase: SupabaseClient,
	viewerId: string,
	projects: OrganisationProject[]
): Promise<ReachableOrganisationProject[]> {
	const rankedIds = await getReachableProjectIds(supabase, viewerId);
	const markedProjects = markReachable(projects, new Set(rankedIds));
	return orderByRankedIds(markedProjects, rankedIds);
}
