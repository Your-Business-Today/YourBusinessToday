import { mapQuestionKind, type MapQuestion } from '$lib/data/workflowMap/mapQuestions';
import { phrasesLeaving, stationPhrasesOf } from '$lib/data/workflowMap/stationPhrases';
import { askedAbout, stationsOnLines, stationsOtherThan, theNamed, type StationOnLine } from './stationsOnLines';
import type { PhraseMatch } from './phraseMatch';
import type { WorkflowMapDraft } from '$lib/data/workflowMap/workflowMap';

/** Axiom 2: everything a task produces is taken in by another task, handed over, or is an output; every station is checked. */
export function destinationGaps(map: WorkflowMapDraft, isSame: PhraseMatch): MapQuestion[] {
	const places = stationsOnLines(map);
	return places.flatMap((place) => stationDestinationGaps(map, place, takenElsewhere(map, places, place), isSame));
}

function stationDestinationGaps(map: WorkflowMapDraft, place: StationOnLine, elsewhere: string[], isSame: PhraseMatch): MapQuestion[] {
	const { key, name, produces, isOutput } = place;
	const leaving = phrasesLeaving(map, key);
	const isProducingNothing = produces.length + leaving.length === 0;
	if (isProducingNothing) return [askedAbout(place, mapQuestionKind.destination, `${name} produces nothing: what does it hand on?`)];
	if (isOutput) return [];
	const taken = [...leaving, ...elsewhere];
	const undelivered = produces.filter((produced) => !taken.some((phrase) => isSame(phrase, produced)));
	return undelivered.map((produced) => askedAbout(place, mapQuestionKind.destination, goesNowhere(name, produced)));
}

function takenElsewhere(map: WorkflowMapDraft, places: StationOnLine[], place: StationOnLine): string[] {
	return stationsOtherThan(places, place).flatMap((other) => stationPhrasesOf(map, other).takesIn);
}

function goesNowhere(stationName: string, produced: string): string {
	return `${stationName} produces ${theNamed(produced)}. Who picks it up, or is it an output the business runs on?`;
}
