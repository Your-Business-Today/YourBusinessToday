import { phraseMeaningOf, type MapVocabulary } from './phraseInDomain';
import { stationPhrasesOf } from './stationPhrases';
import type { MapStation, WorkflowMapVersion } from './workflowMap';

/** Whether a station takes a thing in or produces it. */
export const thingStationRoles = { takesIn: 'takesIn', produces: 'produces' } as const;

export type ThingStationRole = (typeof thingStationRoles)[keyof typeof thingStationRoles];

/** A thing a station touches, which way, and the status its phrase names, if one does. */
export type StationTouch = { thingSlug: string; role: ThingStationRole; status: string | null };

/** The things a station touches: those its phrases are words for, and any slugs filed on it, each once. */
export function stationTouchesOf(map: WorkflowMapVersion, station: MapStation, vocabulary: MapVocabulary): StationTouch[] {
	const phrases = stationPhrasesOf(map, station);
	const resolved = [
		...resolvedTouches(phrases.takesIn, thingStationRoles.takesIn, vocabulary),
		...resolvedTouches(phrases.produces, thingStationRoles.produces, vocabulary)
	];
	const filed = [
		...station.takesInThings.map((thingSlug) => ({ thingSlug, role: thingStationRoles.takesIn, status: null })),
		...station.producesThings.map((thingSlug) => ({ thingSlug, role: thingStationRoles.produces, status: null }))
	];
	return withoutRepeats([...resolved, ...filed]);
}

function resolvedTouches(phrases: string[], role: ThingStationRole, vocabulary: MapVocabulary): StationTouch[] {
	const meanings = phrases.map((phrase) => phraseMeaningOf(vocabulary, phrase));
	return meanings.flatMap((meaning) => {
		if (meaning === null || meaning.thingSlug === null) return [];
		return [{ thingSlug: meaning.thingSlug, role, status: meaning.status }];
	});
}

function withoutRepeats(touches: StationTouch[]): StationTouch[] {
	const keys = touches.map(touchKey);
	const firstOfEach = touches.filter((touch, index) => keys.indexOf(touchKey(touch)) === index);
	return firstOfEach.filter((touch) => touch.status !== null || !hasStatusedTwin(firstOfEach, touch));
}

function hasStatusedTwin(touches: StationTouch[], plain: StationTouch): boolean {
	return touches.some((touch) => touch.status !== null && touch.thingSlug === plain.thingSlug && touch.role === plain.role);
}

function touchKey({ thingSlug, role, status }: StationTouch): string {
	return `${thingSlug}:${role}:${status ?? ''}`;
}
