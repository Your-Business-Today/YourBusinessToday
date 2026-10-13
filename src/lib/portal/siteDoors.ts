import { companyDetails } from '$lib/data/companyDetails';

export type SiteDoor = { isPortal: boolean; otherDoorOrigin: string };

export const productionPortalHost = 'portal.yourbusiness.today';
export const portalHomePath = '/';
export const portalRoutePath = '/portal';
export const portalProjectRouteId = `${portalRoutePath}/projects/[projectId]`;

const portalProjectPathPattern = /^\/projects\/[^/]+$/;

const portalSubdomain = 'portal.';
const productionStaffHost = new URL(companyDetails.websiteUrl).host;

/** The configured host is the portal, and so is any host under the portal subdomain, such as portal.localhost:5173. */
export function isPortalHost(host: string, configuredPortalHost: string): boolean {
	return host === configuredPortalHost || host.startsWith(portalSubdomain);
}

export function staffHostFor(portalHost: string): string {
	if (!portalHost.startsWith(portalSubdomain)) return productionStaffHost;
	return portalHost.slice(portalSubdomain.length);
}

export function portalHostFor(staffHost: string, configuredPortalHost: string): string {
	if (staffHostFor(configuredPortalHost) === staffHost) return configuredPortalHost;
	return `${portalSubdomain}${staffHost}`;
}

export function siteDoorFor(url: URL, configuredPortalHost: string): SiteDoor {
	if (isPortalHost(url.host, configuredPortalHost)) {
		return { isPortal: true, otherDoorOrigin: `${url.protocol}//${staffHostFor(url.host)}` };
	}
	const portalHost = portalHostFor(url.host, configuredPortalHost);
	return { isPortal: false, otherDoorOrigin: `${url.protocol}//${portalHost}` };
}

export function portalOriginFor(origin: string, configuredPortalHost: string): string {
	const url = new URL(origin);
	const door = siteDoorFor(url, configuredPortalHost);
	if (door.isPortal) return url.origin;
	return door.otherDoorOrigin;
}

/** The portal's front door and its project pages live under /portal inside the app. */
export function portalReroute(url: URL, configuredPortalHost: string): string | undefined {
	if (!isPortalHost(url.host, configuredPortalHost)) return undefined;
	if (url.pathname === portalHomePath) return portalRoutePath;
	if (portalProjectPathPattern.test(url.pathname)) return `${portalRoutePath}${url.pathname}`;
	return undefined;
}

export function portalProjectPath(projectId: string): string {
	return `/projects/${projectId}`;
}
