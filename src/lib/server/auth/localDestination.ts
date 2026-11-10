import { getMemberProjectIds } from '$lib/server/members/getMemberProjectIds';
import { getOwnedProjectIds } from '$lib/server/projects/getOwnedProjectIds';
import type { SupabaseClient } from '@supabase/supabase-js';

export const defaultDestination = '/';
export const projectsDestination = '/projects';

/** Only a same-site path is safe to send someone to; anything else lands on the default. */
export function localDestinationOrDefault(destination: string | null): string {
	if (isLocalPath(destination)) return destination;
	return defaultDestination;
}

/** The projects page for anyone with a project to go to; the front page for everyone else. */
export async function homeDestinationFor(
	supabase: SupabaseClient,
	userId: string
): Promise<string> {
	const [ownedProjectIds, memberProjectIds] = await Promise.all([
		getOwnedProjectIds(supabase, userId),
		getMemberProjectIds(supabase, userId)
	]);
	if (ownedProjectIds.length + memberProjectIds.length > 0) return projectsDestination;
	return defaultDestination;
}

export function isLocalPath(destination: string | null): destination is string {
	return destination !== null && destination.startsWith('/') && !destination.startsWith('//');
}
