import { routeShape } from './mcpMap';
import type { SiteMap } from './siteMap';

/** A route the parity audit names, with the site map's screen of the same shape when the site map has one. */
export type PairedScreen = { route: string; siteMapRoute: string | null };

export function pairedScreensOf(routes: string[], siteMap: SiteMap | null): PairedScreen[] {
	const siteMapRoutes = siteMap === null ? [] : siteMap.screens.map((screen) => screen.route);
	return routes.map((route) => ({ route, siteMapRoute: routeOfSameShape(siteMapRoutes, route) }));
}

function routeOfSameShape(siteMapRoutes: string[], route: string): string | null {
	const shape = routeShape(route);
	return siteMapRoutes.find((siteMapRoute) => routeShape(siteMapRoute) === shape) ?? null;
}
