import { inputsOf, outputsOf, type StationInput, type StationOutput } from './stationFlows';
import { placedStation, type PlacedStation } from './placedStation';
import { thingNameOf } from './thingNames';
import { firstLineColour } from './workflowLineMap';
import { isPhraseInDomain, isVocabularyFiled, type MapVocabulary } from '$lib/data/workflowMap/phraseInDomain';
import { allPhrasesOf, stationPhrasesOf } from '$lib/data/workflowMap/stationPhrases';
import { stationTouchesOf } from '$lib/data/workflowMap/stationThings';
import type { LineColour } from '$lib/components/lineMap/layout/lineMapModel';
import type { StationState, WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';

/** Where a station is done now, in which state, and where it was done before when that was somewhere else. */
export type StationPlace = { place: string | null; state: StationState; earlierPlace: string | null };

/** A Domain thing a station touches, by its slug, with its name as a person reads it and the status its phrase names. */
export type StationThing = { slug: string; name: string; status: string | null };

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
	phrasesNotWords: string[];
};

/** What the page knows beside the map shown: the Before to compare with, each role's colour, the products' names and the domain's words. */
export type StationSurroundings = {
	earlierMap: WorkflowMapVersion | null;
	colours: Map<string, LineColour>;
	productNames: Record<string, string>;
	vocabulary: MapVocabulary;
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
		things: thingsTouchedBy(shown, placed, surroundings.vocabulary),
		phrasesNotWords: phrasesNotWordsOf(shown, placed, surroundings.vocabulary)
	};
}

function thingsTouchedBy(shown: WorkflowMapVersion, placed: PlacedStation, vocabulary: MapVocabulary): StationThing[] {
	const touches = stationTouchesOf(shown, placed, vocabulary);
	const named = touches.map(({ thingSlug, status }) => ({ slug: thingSlug, name: thingNameOf(thingSlug), status }));
	const keys = named.map(stationThingKey);
	return named.filter((thing, index) => keys.indexOf(stationThingKey(thing)) === index);
}

/** A thing is named once for each status the station's phrases give it. */
export function stationThingKey({ slug, status }: StationThing): string {
	return `${slug}:${status ?? ''}`;
}

function phrasesNotWordsOf(shown: WorkflowMapVersion, placed: PlacedStation, vocabulary: MapVocabulary): string[] {
	if (!isVocabularyFiled(vocabulary)) return [];
	const phrases = allPhrasesOf(stationPhrasesOf(shown, placed));
	return phrases.filter((phrase) => !isPhraseInDomain(vocabulary, phrase));
}

function placeOf(placed: PlacedStation, earlier: PlacedStation | null, productNames: Record<string, string>): StationPlace {
	const productName = placed.productId === null ? null : (productNames[placed.productId] ?? null);
	const place = productName ?? placed.doneIn;
	const earlierPlace = earlier?.doneIn ?? null;
	return { place, state: placed.state, earlierPlace: earlierPlace === place ? null : earlierPlace };
}
