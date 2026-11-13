import { lineColourAt } from '$lib/components/lineMap/lineColourOrder';
import { journeysThrough } from '$lib/data/journeyMap/journeyMapReading';
import { isEntryPoint, isLinked, viewNameAt } from './journeyViews';
import type { Journey, JourneyMap, MapView } from '$lib/data/journeyMap/journeyMap';
import type { LineColour } from '$lib/components/lineMap/layout/lineMapModel';

/** A journey as a row or a panel names it: its name beside a swatch of its line's colour. */
export type JourneyMark = { key: string; name: string; colour: LineColour };

/** A step of a journey the person cannot take: nothing links to it from the step before, and nobody arrives there. */
export type UnreachedStep = {
	route: string;
	journeyName: string;
	fromName: string | null;
};

/** One row of the table of every view. */
export type ViewRow = {
	route: string;
	name: string;
	journeys: JourneyMark[];
	isOnNoJourney: boolean;
	reachedFrom: string[];
	arrivesBy: string[];
	unreachedSteps: UnreachedStep[];
};

export function journeyMarkOf(journey: Journey, colours: Map<string, LineColour>): JourneyMark {
	return {
		key: journey.key,
		name: journey.name,
		colour: colours.get(journey.key) ?? lineColourAt(0)
	};
}

/** Every view filed, in the order it was read back, with the journeys through it and how a person gets there. */
export function viewRowsOf(journeyMap: JourneyMap, colours: Map<string, LineColour>): ViewRow[] {
	const unreachedSteps = journeyMap.journeys.flatMap((journey) => unreachedStepsOf(journeyMap, journey));
	return journeyMap.views.map((view) => {
		const journeys = journeyMarksThrough(journeyMap, view, colours);
		return {
			route: view.route,
			name: view.name,
			journeys,
			isOnNoJourney: journeys.length === 0,
			reachedFrom: namesLinkingTo(journeyMap, view),
			arrivesBy: journeyMap.entryPoints.filter((entryPoint) => entryPoint.route === view.route).map((entryPoint) => entryPoint.arrivesBy),
			unreachedSteps: unreachedSteps.filter((step) => step.route === view.route)
		};
	});
}

function journeyMarksThrough(journeyMap: JourneyMap, view: MapView, colours: Map<string, LineColour>): JourneyMark[] {
	const journeys = journeysThrough(journeyMap, view.route).map((pass) => pass.journey);
	const eachOnce = new Map(journeys.map((journey) => [journey.key, journey]));
	return [...eachOnce.values()].map((journey) => journeyMarkOf(journey, colours));
}

function namesLinkingTo(journeyMap: JourneyMap, view: MapView): string[] {
	const linksIn = journeyMap.links.filter((link) => link.toRoute === view.route);
	return [...new Set(linksIn.map((link) => viewNameAt(journeyMap, link.fromRoute)))];
}

/** The steps of a journey nothing leads to: no link from the step before, and no way to arrive there straight. */
export function unreachedStepsOf(journeyMap: JourneyMap, journey: Journey): UnreachedStep[] {
	const routes = journey.steps.map((step) => step.route);
	return routes.flatMap((route, index) => {
		const previous = index === 0 ? null : routes[index - 1];
		if (isReachedFrom(journeyMap, previous, route)) return [];
		const fromName = previous === null ? null : viewNameAt(journeyMap, previous);
		return [{ route, journeyName: journey.name, fromName }];
	});
}

function isReachedFrom(journeyMap: JourneyMap, previous: string | null, route: string): boolean {
	if (isEntryPoint(journeyMap, route)) return true;
	if (previous === null) return false;
	return previous === route || isLinked(journeyMap, previous, route);
}

/** How many of each fault the table marks. */
export function faultCountsOf(rows: ViewRow[]) {
	return {
		viewsOnNoJourney: rows.filter((row) => row.isOnNoJourney).length,
		unreachedSteps: rows.flatMap((row) => row.unreachedSteps).length
	};
}
