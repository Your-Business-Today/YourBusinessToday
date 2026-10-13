import { screenCountOf, sectionsOf, screensInSection, type Screen, type SiteMap } from '$lib/data/blueprint/siteMap';

export const everySection = '';

/** One crate per section of the site, the whole site first, each with how many screens it holds. */
export function cratesOf(siteMap: SiteMap): { section: string; count: number }[] {
	const sections = sectionsOf(siteMap).map((section) => ({ section, count: screensInSection(siteMap, section).length }));
	return [{ section: everySection, count: screenCountOf(siteMap) }, ...sections];
}

export function screensInCrate(siteMap: SiteMap, section: string): Screen[] {
	if (section === everySection) return siteMap.screens;
	return screensInSection(siteMap, section);
}

/** Where a route sits among every screen, or the first screen when the route is not one of them. */
export function indexOfRoute(screens: Screen[], route: string | null): number {
	const index = screens.findIndex((screen) => screen.route === route);
	return Math.max(index, 0);
}
