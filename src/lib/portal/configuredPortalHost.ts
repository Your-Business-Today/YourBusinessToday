import { env } from '$env/dynamic/public';
import { productionPortalHost } from './siteDoors';

/** PUBLIC_PORTAL_HOST lets a preview deployment stand in as the portal. */
export function configuredPortalHost(): string {
	return env.PUBLIC_PORTAL_HOST || productionPortalHost;
}
