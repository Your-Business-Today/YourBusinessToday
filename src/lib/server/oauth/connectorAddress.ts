import { protectedResourcePath } from './oauthSettings';
import type { SiteDoor } from '$lib/portal/siteDoors';

/** The connector lives on the staff site, so a visitor at the portal is given the other door's address. */
export function connectorAddressFor(door: SiteDoor, url: URL): string {
	const staffOrigin = door.isPortal ? door.otherDoorOrigin : url.origin;
	return `${staffOrigin}${protectedResourcePath}`;
}
