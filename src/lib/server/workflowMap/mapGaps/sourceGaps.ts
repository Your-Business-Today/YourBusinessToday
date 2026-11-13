import { mapQuestionKind, type MapQuestion } from '$lib/data/workflowMap/mapQuestions';
import { phrasesArrivingAt, stationPhrasesOf } from '$lib/data/workflowMap/stationPhrases';
import { askedAbout, stationsOnLines, stationsOtherThan, theNamed, type StationOnLine } from './stationsOnLines';
import type { PhraseMatch } from './phraseMatch';
import type { WorkflowMapDraft } from '$lib/data/workflowMap/workflowMap';

/** Axiom 1: everything a task takes in is made by another task, handed over to it, or arrives at it from outside. */
export function sourceGaps(map: WorkflowMapDraft, isSame: PhraseMatch): MapQuestion[] {
	const places = stationsOnLines(map);
	return places.flatMap((place) => stationSourceGaps(map, place, producedElsewhere(map, places, place), isSame));
}

function stationSourceGaps(map: WorkflowMapDraft, place: StationOnLine, elsewhere: string[], isSame: PhraseMatch): MapQuestion[] {
	const { key, name, takesIn } = place;
	const arriving = phrasesArrivingAt(map, key);
	const isStartedByNothing = takesIn.length + arriving.length === 0;
	if (isStartedByNothing) return [startedByNothing(place)];
	const offered = [...arriving, ...elsewhere];
	const unsourced = takesIn.filter((needed) => !offered.some((phrase) => isSame(needed, phrase)));
	return unsourced.map((needed) => askedAbout(place, mapQuestionKind.source, `${name} needs ${theNamed(needed)}. Where does it come from?`));
}

function producedElsewhere(map: WorkflowMapDraft, places: StationOnLine[], place: StationOnLine): string[] {
	return stationsOtherThan(places, place).flatMap((other) => stationPhrasesOf(map, other).produces);
}

function startedByNothing(place: StationOnLine): MapQuestion {
	const question = `${place.name} takes nothing in and nothing arrives at it: what must exist before it can start?`;
	return askedAbout(place, mapQuestionKind.source, question);
}
