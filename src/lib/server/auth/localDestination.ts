import { belongsAtPortal } from './belongsAtPortal';
import { handOffToOtherDoor } from './handOffToOtherDoor';
import { getMemberProjectIds } from '$lib/server/members/getMemberProjectIds';
import { getOwnedProjectIds } from '$lib/server/projects/getOwnedProjectIds';
import type { SupabaseClient, User } from '@supabase/supabase-js';

export const defaultDestination = '/';
export const projectsDestination = '/projects';

/** Only a same-site path is safe to send someone to; anything else lands on the default. */
export function localDestinationOrDefault(destination: string | null): string {
	if (isLocalPath(destination)) return destination;
	return defaultDestination;
}

/**
 * Where the signed-in session lands: the other door when this is the wrong one
 * for the account, otherwise the path it asked for, or its home.
 */
export async function destinationAfterSignIn(
	locals: App.Locals,
	requestedDestination: string | null
): Promise<string> {
	const { user } = await locals.safeGetSession();
	if (user === null) return defaultDestination;
	const localDestination = isLocalPath(requestedDestination) ? requestedDestination : null;
	if (await isAtWrongDoor(locals, user)) {
		return handOffToOtherDoor(locals, user.email ?? '', localDestination);
	}
	if (localDestination !== null) return localDestination;
	const { door } = locals;
	if (door.isPortal) return defaultDestination;
	return homeDestinationFor(locals.supabase, user.id);
}

async function isAtWrongDoor(locals: App.Locals, user: User): Promise<boolean> {
	if (user.email === undefined) return false;
	const { door } = locals;
	const isPortalAccount = await belongsAtPortal(locals.supabase, user.id);
	return isPortalAccount !== door.isPortal;
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

function isLocalPath(destination: string | null): destination is string {
	return destination !== null && destination.startsWith('/') && !destination.startsWith('//');
}
