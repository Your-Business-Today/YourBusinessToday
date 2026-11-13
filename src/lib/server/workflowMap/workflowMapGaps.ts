import { mapQuestionKind, type MapQuestion, type MapQuestionKind } from '$lib/data/workflowMap/mapQuestions';
import { destinationGaps } from './mapGaps/destinationGaps';
import { handoverGaps } from './mapGaps/handoverGaps';
import { lightGaps } from './mapGaps/lightGaps';
import { phraseMatchOf } from './mapGaps/phraseMatch';
import { sourceGaps } from './mapGaps/sourceGaps';
import { traceGaps } from './mapGaps/traceGaps';
import type { MapVocabulary } from '$lib/data/workflowMap/phraseInDomain';
import type { MapLine, WorkflowMapDraft } from '$lib/data/workflowMap/workflowMap';

/** How soon each kind is asked: what stops an output being traced first, then the hand-overs, then the rest. */
const askingOrder: Record<MapQuestionKind, number> = {
	[mapQuestionKind.source]: 0,
	[mapQuestionKind.destination]: 0,
	[mapQuestionKind.trace]: 0,
	[mapQuestionKind.handover]: 1,
	[mapQuestionKind.role]: 2,
	[mapQuestionKind.place]: 2,
	[mapQuestionKind.outputs]: 2
};

/** What a filed map leaves missing, tested against the axioms of a complete map, each as its question, most important first. */
export function workflowMapGaps(map: WorkflowMapDraft, vocabulary: MapVocabulary): MapQuestion[] {
	const isSame = phraseMatchOf(vocabulary);
	const tracing = [...sourceGaps(map, isSame), ...destinationGaps(map, isSame), ...traceGaps(map, isSame)];
	return rankedQuestions([...tracing, ...handoverGaps(map), ...lightGaps(map)], map.lines);
}

function rankedQuestions(questions: MapQuestion[], lines: MapLine[]): MapQuestion[] {
	const linePositions = new Map(lines.map((line, position) => [line.key, position]));
	const lineOrderOf = ({ lineKey }: MapQuestion) => linePositions.get(lineKey ?? '') ?? lines.length;
	return [...questions].sort((first, second) => rankOf(first) - rankOf(second) || lineOrderOf(first) - lineOrderOf(second));
}

function rankOf({ kind }: MapQuestion): number {
	return askingOrder[kind];
}
