import { journeysThrough, type JourneyPass } from '$lib/data/journeyMap/journeyMapReading';
import { journeyMarkOf } from './journeyViewRows';
import { stepWords } from './journeySiteMapWords';
import type { JourneyMap } from '$lib/data/journeyMap/journeyMap';
import type { LineColour } from '$lib/components/lineMap/layout/lineMapModel';

/** One journey's pass through a view, as the view's panel lists it. */
export type ViewPass = { key: string; name: string; colour: LineColour; role: string; step: string; does: string | null };

/** Every pass a journey makes through the view at a route, in the order the journeys were read back. */
export function viewPassesAt(journeyMap: JourneyMap, route: string, colours: Map<string, LineColour>): ViewPass[] {
	return journeysThrough(journeyMap, route).map((pass) => viewPassOf(pass, colours));
}

function viewPassOf(pass: JourneyPass, colours: Map<string, LineColour>): ViewPass {
	const { journey, stepNumber, stepCount, does } = pass;
	const { name, colour } = journeyMarkOf(journey, colours);
	return {
		key: `${journey.key}-${stepNumber}`,
		name,
		colour,
		role: journey.role,
		step: stepWords(stepNumber, stepCount),
		does
	};
}
