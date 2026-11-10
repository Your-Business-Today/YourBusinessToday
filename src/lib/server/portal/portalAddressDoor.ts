import { destinationAfterSignIn } from '$lib/server/auth/destinationAfterSignIn';
import { homeInsideThePortal } from '$lib/portal/portalAddress';
import { portalSignInPath } from '$lib/portal/portalPaths';

/** Where the front door of the portal address sends a person: to sign in when they are not, otherwise to their home in the portal. */
export async function portalAddressDoor(locals: App.Locals): Promise<string> {
	const { user } = await locals.safeGetSession();
	if (user === null) return portalSignInPath;
	const home = await destinationAfterSignIn(locals, null);
	return homeInsideThePortal(home);
}
