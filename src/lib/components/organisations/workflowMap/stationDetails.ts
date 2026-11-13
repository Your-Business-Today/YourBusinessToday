import { inputsOf, outputsOf, type StationInput, type StationOutput } from './stationFlows';
import { placedStation, type PlacedStation } from './placedStation';
import { thingNameOf } from './thingNames';
import { firstLineColour } from './workflowLineMap';
import type { LineColour } from '$lib/components/lineMap/layout/lineMapModel';
import type { StationState, WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';

/** Where a station is done now, in which state, and where it was done before when that was somewhere else. */
export type StationPlace = { place: string | null; state: StationState; earlierPlace: string | null };

/** A Domain thing a station names, by its slug, with its name as a person reads it. */
export type StationThing = { slug: string; name: string };

/** Everything the panel under the map says about one station. */
export type StationDetails = {
	key: string;
	name: string;
	summary: string;
	lineName: string;
	lineColour: LineColour;
	inputs: StationInput[];
	outputs: StationOutput[];
	place: StationPlace;
	things: StationThing[];
};

/** What the page knows beside the map shown: the Before to compare with, each role's colour and the products' names. */
export type StationSurroundings = {
	earlierMap: WorkflowMapVersion | null;
	colours: Map<string, LineColour>;
	productNames: Record<string, string>;
};

/** The panel's account of the station a key names on the map shown, or null when the map has no such station. */
export function stationDetailsOf(shown: WorkflowMapVersion, surroundings: StationSurroundings, stationKey: string): StationDetails | null {
	const placed = placedStation(shown, stationKey);
	if (placed === null) return null;
	const earlier = surroundings.earlierMap === null ? null : placedStation(surroundings.earlierMap, stationKey);
	return {
		key: placed.key,
		name: placed.name,
		summary: placed.summary,
		lineName: placed.lineName,
		lineColour: surroundings.colours.get(placed.lineKey) ?? firstLineColour,
		inputs: inputsOf(shown, placed),
		outputs: outputsOf(shown, placed),
		place: placeOf(placed, earlier, surroundings.productNames),
		things: thingsNamedBy(placed)
	};
}

function thingsNamedBy({ takesInThings, producesThings }: PlacedStation): StationThing[] {
	const slugs = [...new Set([...takesInThings, ...producesThings])];
	return slugs.map((slug) => ({ slug, name: thingNameOf(slug) }));
}

function placeOf(placed: PlacedStation, earlier: PlacedStation | null, productNames: Record<string, string>): StationPlace {
	const productName = placed.productId === null ? null : (productNames[placed.productId] ?? null);
	const place = productName ?? placed.doneIn;
	const earlierPlace = earlier?.doneIn ?? null;
	return { place, state: placed.state, earlierPlace: earlierPlace === place ? null : earlierPlace };
}
