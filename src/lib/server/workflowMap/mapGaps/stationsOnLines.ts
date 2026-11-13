import type { MapLine, MapStation, WorkflowMapDraft } from '$lib/data/workflowMap/workflowMap';
import type { MapQuestion, MapQuestionKind } from '$lib/data/workflowMap/mapQuestions';

/** A station with the key and the name of the line it sits on. */
export type StationOnLine = MapStation & { lineKey: string; lineName: string };

/** Every station of the map with its line, in the map's own order. */
export function stationsOnLines({ lines }: Pick<WorkflowMapDraft, 'lines'>): StationOnLine[] {
	return lines.flatMap(stationsOfLine);
}

function stationsOfLine({ key, name, stations }: MapLine): StationOnLine[] {
	return stations.map((station) => ({ ...station, lineKey: key, lineName: name }));
}

/** A question about one station, on its line. */
export function askedAbout({ key, name, lineKey, lineName }: StationOnLine, kind: MapQuestionKind, question: string): MapQuestion {
	return { kind, question, stationKey: key, stationName: name, lineKey, lineName };
}

/** Every station of the map but one. */
export function stationsOtherThan(places: StationOnLine[], { key }: StationOnLine): StationOnLine[] {
	return places.filter((other) => other.key !== key);
}

/** A first word written as an ordinary word at the start of a sentence: a capital, then only small letters. */
const ordinaryFirstWord = /^[A-Z][a-z'’-]*$/;

/** A phrase as a question names it: "the rate card", keeping a first word that is a name or an initialism, such as "VAT return". */
export function theNamed(phrase: string): string {
	const trimmed = phrase.trim();
	const [firstWord] = trimmed.split(' ');
	const isOrdinary = ordinaryFirstWord.test(firstWord);
	const wording = isOrdinary ? trimmed.charAt(0).toLowerCase() + trimmed.slice(1) : trimmed;
	return `the ${wording}`;
}
