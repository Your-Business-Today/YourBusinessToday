import type { LineMapModel, MapHandover } from './lineMapModel';
import type { Columns } from './stationColumns';

const CutWeights = { handover: 3, line: 1 } as const;

export type Timeline = { model: LineMapModel; forward: MapHandover[]; columns: Columns };

/** How much carries on past a cut after a column: each hand-over and each line that has to leave one row for the next. */
export function crossingsAfter(column: number, timeline: Timeline): number {
	const { model, forward, columns } = timeline;
	const isAcross = (from: string, to: string) => columns[from] <= column && columns[to] > column;
	const handoversAcross = forward.filter((handover) => isAcross(handover.from, handover.to)).length;
	const linesAcross = model.lines.filter((line) => isAcross(line.stops[0], line.stops.at(-1) ?? line.stops[0])).length;
	return handoversAcross * CutWeights.handover + linesAcross * CutWeights.line;
}

/** Which row each station falls in, once the timeline is cut. */
export function rowsOfStations(columns: Columns, cuts: number[]): Record<string, number> {
	return Object.fromEntries(Object.entries(columns).map(([stationId, column]) => [stationId, cuts.filter((cut) => cut < column).length]));
}
