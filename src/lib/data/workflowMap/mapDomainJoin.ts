import { isPhraseInDomain, isWordFor, wordingOf, type MapVocabulary, type VocabularyThing } from './phraseInDomain';
import { allPhrasesOf, stationPhrasesOf } from './stationPhrases';
import { mapPhrasesOf } from './mapPhrases';
import type { DomainTermFact } from '$lib/data/businessBrainDomain';
import type { ThingStation } from './thingStations';
import type { WorkflowMapVersion } from './workflowMap';

/** The phrases a map's stations take in or produce and its hand-overs pass that are neither a thing nor a word. */
export function phrasesNotWords(map: WorkflowMapVersion, vocabulary: MapVocabulary): string[] {
	return mapPhrasesOf(map).filter((phrase) => !isPhraseInDomain(vocabulary, phrase));
}

/** The names of a map's lines that are neither a thing nor a word. */
export function linesNotWords({ lines }: WorkflowMapVersion, vocabulary: MapVocabulary): string[] {
	return lines.map((line) => line.name).filter((name) => !isPhraseInDomain(vocabulary, name));
}

/** The things no station takes in or produces. */
export function thingsOnNoStation(things: VocabularyThing[], thingStations: ThingStation[]): VocabularyThing[] {
	const touched = new Set(thingStations.map((station) => station.thingSlug));
	return things.filter((thing) => !touched.has(thing.slug));
}

/** How many stations of the map use a word: in a phrase they take in, produce or pass on, or as the name of their line. */
export function stationsUsingWord(map: WorkflowMapVersion | null, word: DomainTermFact): number {
	if (map === null) return 0;
	const isUsed = (phrase: string) => isWordFor(word, wordingOf(phrase));
	return map.lines
		.flatMap((line) => line.stations.map((station) => ({ line, station })))
		.filter(({ line, station }) => isUsed(line.name) || allPhrasesOf(stationPhrasesOf(map, station)).some(isUsed)).length;
}
