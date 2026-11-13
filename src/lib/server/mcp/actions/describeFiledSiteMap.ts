import { screenAtRoute, type SiteMap } from '$lib/data/blueprint/siteMap';
import { describeJourneyMap } from './describeJourneyMap';
import { describeJourneyView } from './describeJourneyView';
import type { JourneyMap } from '$lib/data/journeyMap/journeyMap';

/** What read_project_site_map is reading: the filed journeys, and the kit's site definition when the repository has one. */
export type FiledSiteMap = {
	journeyMap: JourneyMap;
	siteDefinition: SiteMap | null;
	projectName: string;
};

/**
 * A product whose journeys are filed, read as journeys: every view and every journey, or for one route the journeys
 * that pass through it, with what a user sees there when the kit's site definition draws that screen.
 */
export function describeFiledSiteMap(filed: FiledSiteMap, route: string | null): string {
	const { journeyMap, projectName } = filed;
	if (route === null) return describeJourneyMap(journeyMap, projectName);
	const journeys = describeJourneyView(journeyMap, projectName, route);
	const wireframe = wireframeAt(filed.siteDefinition, route);
	if (wireframe === null) return journeys;
	return `${journeys}\n\n${wireframe}`;
}

function wireframeAt(siteDefinition: SiteMap | null, route: string): string | null {
	if (siteDefinition === null) return null;
	const screen = screenAtRoute(siteDefinition, route);
	if (screen === undefined) return null;
	return [`Drawn by ${screen.viewFile}. What a user sees, in the kit's widget notation:`, screen.layout].join('\n');
}
