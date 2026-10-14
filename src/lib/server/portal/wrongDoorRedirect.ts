import {
	portalHomePath,
	portalPeopleRouteId,
	portalProjectRouteId,
	portalRoutePath,
	type SiteDoor
} from '$lib/portal/siteDoors';

const portalRouteIds = new Set([
	portalRoutePath,
	portalProjectRouteId,
	portalPeopleRouteId,
	'/account/sign-in',
	'/account/set-password',
	'/auth/callback',
	'/auth/hand-off'
]);

/**
 * The portal serves its own routes and the sign-in routes, and sends anything
 * else to its front door; yourbusiness.today sends the portal's routes to the portal.
 */
export function wrongDoorRedirect(door: SiteDoor, routeId: string | null): string | null {
	if (routeId === null) return null;
	if (door.isPortal) return portalRedirectFor(routeId);
	if (routeId.startsWith(portalRoutePath)) return `${door.otherDoorOrigin}${portalHomePath}`;
	return null;
}

function portalRedirectFor(routeId: string): string | null {
	if (portalRouteIds.has(routeId)) return null;
	return portalHomePath;
}
