import type { MapLine, MapStation, WorkflowMapDraft } from '$lib/data/workflowMap/workflowMap';

type StationPlace = { station: MapStation; line: MapLine; isLastOnLine: boolean };

/** What a filed map leaves missing or unclear, each as the question that fills it, in the map's own order. */
export function workflowMapGaps({ lines, handovers }: WorkflowMapDraft): string[] {
	const givers = new Set(handovers.map((handover) => handover.fromKey));
	const roleGaps = lines.filter(hasOneTask).map(oneTaskGap);
	const stationGaps = lines.flatMap(placesOn).flatMap((place) => stationGapsAt(place, givers));
	return [...roleGaps, ...stationGaps, ...outputGaps(lines)];
}

function hasOneTask({ stations }: MapLine): boolean {
	return stations.length === 1;
}

function oneTaskGap(line: MapLine): string {
	return `The ${line.name} role has one task: what else does it do?`;
}

function placesOn(line: MapLine): StationPlace[] {
	const { stations } = line;
	const lastIndex = stations.length - 1;
	return stations.map((station, index) => ({ station, line, isLastOnLine: index === lastIndex }));
}

function stationGapsAt(place: StationPlace, givers: Set<string>): string[] {
	const { station, line } = place;
	const { takesIn, produces, doneIn } = station;
	const named = `${station.name} (${line.name})`;
	const gaps: string[] = [];
	if (takesIn.length === 0) gaps.push(`${named} takes nothing in: what must exist before it can start?`);
	if (produces.length === 0) gaps.push(`${named} produces nothing: what does it hand on?`);
	if (doneIn === null) gaps.push(`${named} is done nowhere named: is it a product, a spreadsheet, email or paper?`);
	if (goesNowhere(place, givers)) gaps.push(`What ${named} produces goes nowhere: who receives it, or is it an output the business runs on?`);
	return gaps;
}

function goesNowhere({ station, isLastOnLine }: StationPlace, givers: Set<string>): boolean {
	const { key, produces, isOutput } = station;
	const isHandedOver = givers.has(key);
	const hasSomethingToHandOn = produces.length > 0;
	return isLastOnLine && hasSomethingToHandOn && !isOutput && !isHandedOver;
}

function outputGaps(lines: MapLine[]): string[] {
	const stations = lines.flatMap((line) => line.stations);
	const isAnyOutputMarked = stations.some((station) => station.isOutput);
	if (isAnyOutputMarked || stations.length === 0) return [];
	return ['No task is marked as producing an output the business runs on: which ones do?'];
}
