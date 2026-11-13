import { journeysThrough, viewAtRoute, type JourneyPass } from '$lib/data/journeyMap/journeyMapReading';
import { journeyMapVersionLine } from './describeJourneyMap';
import type { JourneyMap, MapLink, MapView } from '$lib/data/journeyMap/journeyMap';

/** One view of a filed journey map as Markdown: what it is for, how people reach it and leave it, and the journeys through it. */
export function describeJourneyView(journeyMap: JourneyMap, projectName: string, route: string): string {
	const view = viewAtRoute(journeyMap, route);
	if (view === undefined) return noViewAt(journeyMap, projectName, route);
	return [
		`${journeyMapVersionLine(journeyMap, projectName)}.`,
		viewHeadline(view),
		...travelLinesOf(journeyMap, route),
		passesSection(journeysThrough(journeyMap, route))
	].join('\n\n');
}

function noViewAt(journeyMap: JourneyMap, projectName: string, route: string): string {
	return `No view at ${route} in ${journeyMapVersionLine(journeyMap, projectName)}. Call read_project_site_map without a route for every view.`;
}

function viewHeadline(view: MapView): string {
	const shows = view.shows === null ? '' : ` Shows ${view.shows}.`;
	return `${view.route}, ${view.name}: ${view.purpose}${shows}`;
}

function travelLinesOf(journeyMap: JourneyMap, route: string): string[] {
	const arrivals = journeyMap.entryPoints.filter((entryPoint) => entryPoint.route === route);
	const leadsTo = journeyMap.links.filter((link) => link.fromRoute === route);
	const reachedFrom = journeyMap.links.filter((link) => link.toRoute === route);
	const lines = [
		listLine('People arrive here by', arrivals.map((entryPoint) => entryPoint.arrivesBy)),
		listLine('Leads to', leadsTo.map((link) => linkEnd(link.toRoute, link))),
		listLine('Reached from', reachedFrom.map((link) => linkEnd(link.fromRoute, link)))
	];
	return lines.filter((line) => line !== null);
}

function listLine(opening: string, items: string[]): string | null {
	if (items.length === 0) return null;
	return `${opening}: ${items.join(', ')}.`;
}

function linkEnd(route: string, link: MapLink): string {
	if (link.how === null) return route;
	return `${route} (${link.how})`;
}

function passesSection(passes: JourneyPass[]): string {
	if (passes.length === 0) return 'No journey passes through it.';
	return ['Journeys through it:', ...passes.map(passLine)].join('\n');
}

function passLine(pass: JourneyPass): string {
	const { journey, stepNumber, stepCount, does } = pass;
	const doing = does === null ? '' : `: ${does}`;
	return `- ${journey.name} (${journey.role}), step ${stepNumber} of ${stepCount}${doing}`;
}
