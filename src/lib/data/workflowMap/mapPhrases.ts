import type { WorkflowMapVersion } from './workflowMap';

/** Every phrase a map's stations take in or produce and its hand-overs pass, each once in its first wording, however it is cased. */
export function mapPhrasesOf({ lines, handovers }: WorkflowMapVersion): string[] {
	const stations = lines.flatMap((line) => line.stations);
	const stationPhrases = stations.flatMap((station) => [...station.takesIn, ...station.produces]);
	const handedOver = handovers.map((handover) => handover.handedOver);
	return firstWordingOfEach([...stationPhrases, ...handedOver].map((phrase) => phrase.trim()));
}

function firstWordingOfEach(phrases: string[]): string[] {
	const seenWordings = new Set<string>();
	return phrases.filter((phrase) => {
		const wording = phrase.toLowerCase();
		const isSeen = seenWordings.has(wording);
		seenWordings.add(wording);
		return !isSeen;
	});
}
