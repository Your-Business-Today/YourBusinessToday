import { mapQuestionKind, type MapQuestion } from '$lib/data/workflowMap/mapQuestions';
import { stationPhrasesOf } from '$lib/data/workflowMap/stationPhrases';
import { askedAbout, stationsOnLines, stationsOtherThan, theNamed, type StationOnLine } from './stationsOnLines';
import type { PhraseMatch } from './phraseMatch';
import type { WorkflowMapDraft } from '$lib/data/workflowMap/workflowMap';

/** Axiom 4: every output traces back, through the tasks that feed it, to something arriving from outside. */
export function traceGaps(map: WorkflowMapDraft, isSame: PhraseMatch): MapQuestion[] {
	const places = stationsOnLines(map);
	const traced = tracedStationKeys(map, places, isSame);
	const untracedOutputs = places.filter(({ key, isOutput }) => isOutput && !traced.has(key));
	return untracedOutputs.map((place) => askedAbout(place, mapQuestionKind.trace, untracedQuestion(place)));
}

function tracedStationKeys(map: WorkflowMapDraft, places: StationOnLine[], isSame: PhraseMatch): Set<string> {
	const feeders = new Map(places.map((place) => [place.key, feedersOf(map, places, place, isSame)]));
	const traced = new Set(map.arrivals.map((arrival) => arrival.stationKey));
	let isGrowing = true;
	while (isGrowing) {
		const reached = places.filter(({ key }) => isNewlyTraced(key, traced, feeders));
		reached.forEach(({ key }) => traced.add(key));
		isGrowing = reached.length > 0;
	}
	return traced;
}

function isNewlyTraced(stationKey: string, traced: Set<string>, feeders: Map<string, string[]>): boolean {
	if (traced.has(stationKey)) return false;
	const stationFeeders = feeders.get(stationKey) ?? [];
	return stationFeeders.some((feederKey) => traced.has(feederKey));
}

function feedersOf(map: WorkflowMapDraft, places: StationOnLine[], place: StationOnLine, isSame: PhraseMatch): string[] {
	const { takesIn } = stationPhrasesOf(map, place);
	const handedIn = map.handovers.filter(({ toKey }) => toKey === place.key);
	const makers = stationsOtherThan(places, place).filter((other) => {
		const { produces } = stationPhrasesOf(map, other);
		return takesIn.some((needed) => produces.some((offered) => isSame(needed, offered)));
	});
	return [...handedIn.map(({ fromKey }) => fromKey), ...makers.map(({ key }) => key)];
}

function untracedQuestion({ name, produces }: StationOnLine): string {
	const output = produces.length === 0 ? `what ${name} produces` : theNamed(produces[0]);
	return `I cannot trace ${output} back to where the work starts. What am I missing?`;
}
