import { isAtPortalAddress } from './portalAddress';

export const portalHomePath = '/portal';
export const portalPeoplePath = `${portalHomePath}/people`;
export const portalConnectPath = `${portalHomePath}/connect`;
export const portalWorkflowMapPath = `${portalHomePath}/workflow-map`;
export const portalBillingPath = `${portalHomePath}/billing`;
export const portalSignInPath = `/account/sign-in?next=${encodeURIComponent(portalHomePath)}`;

const destinationParameter = 'next';
const querySeparator = '?';
const pathSeparator = '/';
const accountPathsServedToClients = new Set(['/account/sign-in', '/account/set-password']);

/** The portal is the part of the site under /portal; a path may carry its query. */
export function isPortalPath(path: string): boolean {
	const [pathname] = path.split(querySeparator);
	return pathname === portalHomePath || pathname.startsWith(`${portalHomePath}${pathSeparator}`);
}

/** A client contact is sent to the portal, its own pages and the account pages that sign them in. */
export function isPathForClientContact(path: string): boolean {
	const [pathname] = path.split(querySeparator);
	return isPortalPath(pathname) || accountPathsServedToClients.has(pathname);
}

/** A portal page, the sign-in page on the way to one, and every page at the portal's own address wear the portal's header. */
export function isPortalPage(url: URL): boolean {
	const destination = url.searchParams.get(destinationParameter) ?? '';
	return isAtPortalAddress(url) || isPortalPath(url.pathname) || isPortalPath(destination);
}

export function portalProjectPath(projectId: string): string {
	return `${portalHomePath}/projects/${projectId}`;
}

/** One invoice raised to the client, as a document they can print or save. */
export function portalBilledInvoicePath(invoiceId: string): string {
	return `${portalBillingPath}/invoices/${invoiceId}`;
}
