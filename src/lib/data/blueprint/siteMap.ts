/**
 * A project's site map, read from the site definition the project-process kit writes: every screen a user
 * reaches, the view that draws it and what they see there in the kit's widget notation.
 */
export type SiteMap = {
	screens: Screen[];
};

export type Screen = {
	route: string;
	viewFile: string;
	layout: string;
	section: string;
	entityName: string | null;
};

const rootSection = 'home';
const routeSeparator = '/';

/** The first part of a route, which groups the screens the way the navigation does: /jobs/{Id} is in jobs. */
export function sectionOfRoute(route: string): string {
	const firstPart = route.split(routeSeparator).find((part) => part !== '');
	return firstPart ?? rootSection;
}

export function screenCountOf(siteMap: SiteMap): number {
	const { screens } = siteMap;
	return screens.length;
}

export function screenAtRoute(siteMap: SiteMap, route: string): Screen | undefined {
	return siteMap.screens.find((screen) => screen.route === route);
}

export function sectionsOf(siteMap: SiteMap): string[] {
	return [...new Set(siteMap.screens.map((screen) => screen.section))];
}

export function screensInSection(siteMap: SiteMap, section: string): Screen[] {
	return siteMap.screens.filter((screen) => screen.section === section);
}

export function screensOfEntity(siteMap: SiteMap, entityName: string): Screen[] {
	return siteMap.screens.filter((screen) => screen.entityName === entityName);
}
