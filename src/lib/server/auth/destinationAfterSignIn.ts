import { belongsAtPortal } from './belongsAtPortal';
import { isConnectorDestination } from './connectorDestination';
import { defaultDestination, homeDestinationFor, isLocalPath } from './localDestination';
import { readFramePicks } from '$lib/server/frame/readFramePicks';
import { isPathForClientContact, isPortalPath, portalHomePath } from '$lib/portal/portalPaths';

const homeRequests = new Set([defaultDestination, portalHomePath]);

/**
 * Where the signed-in session lands: the connector's next step when it is connecting a Claude, the
 * page it asked for when it may go there, otherwise its home — the project picked last in the side bar.
 */
export async function destinationAfterSignIn(
	locals: App.Locals,
	requestedDestination: string | null
): Promise<string> {
	const { user } = await locals.safeGetSession();
	if (user === null) return defaultDestination;
	const localDestination = isLocalPath(requestedDestination) ? requestedDestination : null;
	if (isConnectorDestination(localDestination)) return localDestination;
	const isAtPortal = await belongsAtPortal(locals.supabase, user.id);
	const askedPage = isAtPortal ? portalPageAsked(localDestination) : sitePageAsked(localDestination);
	if (askedPage !== null) return askedPage;
	const { picks } = await readFramePicks(locals, user.id, locals.rememberedPicks);
	if (picks.homePath !== null) return picks.homePath;
	if (isAtPortal) return portalHomePath;
	return homeDestinationFor(locals.supabase, user.id);
}

/** Asking for a home page is asking for home, which opens on the picked project. */
function isHomeRequest(destination: string): boolean {
	return homeRequests.has(destination);
}

function portalPageAsked(destination: string | null): string | null {
	if (destination === null || isHomeRequest(destination)) return null;
	return isPathForClientContact(destination) ? destination : null;
}

function sitePageAsked(destination: string | null): string | null {
	if (destination === null || isHomeRequest(destination)) return null;
	return isPortalPath(destination) ? null : destination;
}
