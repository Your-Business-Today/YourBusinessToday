import { StationStates, type LineColour, type LineMapModel, type MapStation } from '$lib/components/lineMap/layout/lineMapModel';
import { lineColourAt } from '$lib/components/lineMap/lineColourOrder';
import { rolesOf } from '$lib/data/journeyMap/journeyMapReading';
import { viewNameAt } from './journeyViews';
import type { Journey, JourneyMap } from '$lib/data/journeyMap/journeyMap';

/** The journeys of one role, in the order they were read back. */
export function journeysOfRole(journeyMap: JourneyMap, role: string): Journey[] {
	return journeyMap.journeys.filter((journey) => journey.role === role);
}

/** Each journey's colour, by its place among its own role's journeys, so one role's map repeats no colour it can avoid. */
export function journeyColoursOf(journeyMap: JourneyMap): Map<string, LineColour> {
	const colours = new Map<string, LineColour>();
	for (const role of rolesOf(journeyMap)) {
		journeysOfRole(journeyMap, role).forEach((journey, index) => colours.set(journey.key, lineColourAt(index)));
	}
	return colours;
}

/** The views a journey stops at, in order, each once: a view it comes back to is already a station on its line. */
export function stopsOf(journey: Journey): string[] {
	return [...new Set(journey.steps.map((step) => step.route))];
}

/**
 * One role's journeys as the line map draws them: a line is a journey, a station is a view by its route, and a view
 * several journeys share is one station on each of their lines, which the line map draws as one capsule across them.
 */
export function journeyLineMapOf(journeyMap: JourneyMap, role: string, colours: Map<string, LineColour>): LineMapModel {
	const journeys = journeysOfRole(journeyMap, role);
	const routes = [...new Set(journeys.flatMap(stopsOf))];
	return {
		lines: journeys.map((journey) => ({
			id: journey.key,
			name: journey.name,
			colour: colours.get(journey.key) ?? lineColourAt(0),
			stops: stopsOf(journey)
		})),
		stations: Object.fromEntries(routes.map((route) => [route, stationOf(journeyMap, route)])),
		handovers: []
	};
}

function stationOf(journeyMap: JourneyMap, route: string): MapStation {
	const name = viewNameAt(journeyMap, route);
	return { name, state: StationStates.elsewhere, description: `${name}, the view at ${route}` };
}
