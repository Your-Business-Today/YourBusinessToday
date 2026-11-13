import { countOf } from '$lib/data/countOf';
import { formatBritishDate } from '$lib/data/britishDate';
import { journeysThrough, rolesOf, shortCommit } from '$lib/data/journeyMap/journeyMapReading';
import type { Journey, JourneyMap, MapView } from '$lib/data/journeyMap/journeyMap';

const routeArrow = ' → ';

/** A filed journey map as Markdown: where people arrive, each role's journeys in order, then every view. */
export function describeJourneyMap(journeyMap: JourneyMap, projectName: string): string {
	return [
		headlineOf(journeyMap, projectName),
		...arrivalsOf(journeyMap),
		...journeySectionsOf(journeyMap),
		['## Views', ...journeyMap.views.map((view) => viewLine(journeyMap, view))].join('\n')
	].join('\n\n');
}

/** Which version is read, from which commit and when: the line every reading of a filed map opens with. */
export function journeyMapVersionLine(journeyMap: JourneyMap, projectName: string): string {
	const filedOn = formatBritishDate(journeyMap.filedAt);
	return `${projectName} site map, version ${journeyMap.versionNumber}, read from commit ${shortCommit(journeyMap)} and filed on ${filedOn}`;
}

function headlineOf(journeyMap: JourneyMap, projectName: string): string {
	const { views, journeys, links } = journeyMap;
	const counts = [countOf(views.length, 'view'), countOf(journeys.length, 'journey'), countOf(links.length, 'link')];
	return `${journeyMapVersionLine(journeyMap, projectName)}: ${counts.join(', ')}. Give a route to see the journeys that pass through it.`;
}

function arrivalsOf(journeyMap: JourneyMap): string[] {
	const { entryPoints } = journeyMap;
	if (entryPoints.length === 0) return [];
	const lines = entryPoints.map((entryPoint) => `- ${entryPoint.route}, by ${entryPoint.arrivesBy}`);
	return [['## Where people arrive', ...lines].join('\n')];
}

function journeySectionsOf(journeyMap: JourneyMap): string[] {
	return rolesOf(journeyMap).map((role) => {
		const journeysOfRole = journeyMap.journeys.filter((journey) => journey.role === role);
		return [`## ${role}'s journeys`, ...journeysOfRole.map(journeyLine)].join('\n');
	});
}

function journeyLine(journey: Journey): string {
	const path = journey.steps.map((step) => step.route).join(routeArrow);
	const station = journey.stationKey === null ? '' : ` Carries out station ${journey.stationKey}.`;
	return `- ${journey.name} (${journey.key}): ${path}.${station}\n  ${journey.story}`;
}

function viewLine(journeyMap: JourneyMap, view: MapView): string {
	const shows = view.shows === null ? '' : ` Shows ${view.shows}.`;
	const passCount = journeysThrough(journeyMap, view.route).length;
	const onJourneys = passCount === 0 ? ' On no journey.' : '';
	return `- ${view.route}, ${view.name}: ${view.purpose}${shows}${onJourneys}`;
}
