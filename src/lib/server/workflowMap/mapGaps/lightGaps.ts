import { lineKind, type MapLine, type WorkflowMapDraft } from '$lib/data/workflowMap/workflowMap';
import { mapQuestionKind, type MapQuestion } from '$lib/data/workflowMap/mapQuestions';
import { askedAbout, stationsOnLines } from './stationsOnLines';

/** The checks that are not axioms: a role with one task, a role's task done nowhere named, and a map with no output marked. */
export function lightGaps(map: WorkflowMapDraft): MapQuestion[] {
	const roles = map.lines.filter((line) => line.kind === lineKind.role);
	return [...roles.filter(hasOneTask).map(oneTaskGap), ...placeGaps(roles), ...outputGaps(map)];
}

function hasOneTask({ stations }: MapLine): boolean {
	return stations.length === 1;
}

function oneTaskGap(line: MapLine): MapQuestion {
	const question = `The ${line.name} role has one task: what else does it do?`;
	return { kind: mapQuestionKind.role, question, stationKey: null, stationName: null, lineKey: line.key, lineName: line.name };
}

function placeGaps(roles: MapLine[]): MapQuestion[] {
	const placesDoneNowhere = stationsOnLines({ lines: roles }).filter(({ doneIn }) => doneIn === null);
	return placesDoneNowhere.map((place) => askedAbout(place, mapQuestionKind.place, doneNowhere(place.name)));
}

function doneNowhere(stationName: string): string {
	return `${stationName} is done nowhere named: is it a product, a spreadsheet, email or paper?`;
}

function outputGaps(map: WorkflowMapDraft): MapQuestion[] {
	const stations = stationsOnLines(map);
	const isAnyOutputMarked = stations.some((station) => station.isOutput);
	if (isAnyOutputMarked || stations.length === 0) return [];
	const question = 'No task is marked as producing an output the business runs on: which ones do?';
	return [{ kind: mapQuestionKind.outputs, question, stationKey: null, stationName: null, lineKey: null, lineName: null }];
}
