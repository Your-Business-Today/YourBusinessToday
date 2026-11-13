import { isFilledText } from '$lib/data/filledText';
import { mapQuestionKind, type MapQuestion } from '$lib/data/workflowMap/mapQuestions';
import { askedAbout, stationsOnLines, theNamed, type StationOnLine } from './stationsOnLines';
import type { MapHandover, WorkflowMapDraft } from '$lib/data/workflowMap/workflowMap';

/** Axiom 3: every hand-over says what goes wrong there; any answer filed, even that nothing does, closes the question. */
export function handoverGaps(map: WorkflowMapDraft): MapQuestion[] {
	const places = new Map(stationsOnLines(map).map((place) => [place.key, place]));
	const unanswered = map.handovers.filter((handover) => !isFilledText(handover.goesWrong));
	return unanswered.flatMap((handover) => {
		const giving = places.get(handover.fromKey);
		const taking = places.get(handover.toKey);
		if (giving === undefined || taking === undefined) return [];
		return [askedAbout(giving, mapQuestionKind.handover, goesWrongQuestion(handover, giving, taking))];
	});
}

function goesWrongQuestion({ handedOver }: MapHandover, giving: StationOnLine, taking: StationOnLine): string {
	return `When the ${giving.lineName} hands ${theNamed(handedOver)} to the ${taking.lineName}, what goes wrong or is delayed?`;
}
