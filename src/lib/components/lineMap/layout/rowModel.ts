import type { LineMapModel, MapHandover, MapLine, MapStation } from './lineMapModel';
import { homeLineOf } from './stationLines';

/** The piece of a wrapped map that one row draws, with a stop at its edges for each line that carries on. */
export type RowModel = { model: LineMapModel; leavingStops: string[]; giverOf: Map<string, string> };

type Wrapping = { model: LineMapModel; forward: MapHandover[]; rowOf: Record<string, number> };

const unnamedEdge: MapStation = { name: '' };

const EdgeMarks = { arriving: '⟵', leaving: '⟶' } as const;

export const arrivingStop = (row: number, lineId: string) => `${EdgeMarks.arriving}${row}:${lineId}`;
export const leavingStop = (row: number, lineId: string) => `${row}:${lineId}${EdgeMarks.leaving}`;
const isLeavingStop = (stationId: string) => stationId.endsWith(EdgeMarks.leaving);
const branchKey = (from: string, to: string) => `${from}→${to}`;

function rowsReachedBy(line: MapLine, wrapping: Wrapping): number[] {
	const { forward, rowOf } = wrapping;
	const handedOn = forward.filter((handover) => line.stops.includes(handover.from)).map((handover) => rowOf[handover.to]);
	return [...line.stops.map((stationId) => rowOf[stationId]), ...handedOn];
}

function lineInRow(line: MapLine, wrapping: Wrapping, row: number): MapLine[] {
	const reached = rowsReachedBy(line, wrapping);
	const [first, last] = [Math.min(...reached), Math.max(...reached)];
	if (row < first || row > last) return [];
	const stops = line.stops.filter((stationId) => wrapping.rowOf[stationId] === row);
	const arriving = row > first ? [arrivingStop(row, line.id)] : [];
	const leaving = row < last ? [leavingStop(row, line.id)] : [];
	return [{ ...line, stops: [...arriving, ...stops, ...leaving] }];
}

function handoversInRow(wrapping: Wrapping, row: number, giverOf: Map<string, string>): MapHandover[] {
	const { model, forward, rowOf } = wrapping;
	const arrivingHere = forward.filter((handover) => rowOf[handover.to] === row);
	return arrivingHere.flatMap((handover) => {
		if (rowOf[handover.from] === row) return [handover];
		const from = arrivingStop(row, homeLineOf(model, handover.from));
		const key = branchKey(from, handover.to);
		if (giverOf.has(key)) return [];
		giverOf.set(key, handover.from);
		return [{ from, to: handover.to }];
	});
}

function edgeStations(lines: MapLine[], rowOf: Record<string, number>): Record<string, MapStation> {
	const edges = lines.flatMap((line) => line.stops).filter((stationId) => !(stationId in rowOf));
	return Object.fromEntries(edges.map((stationId) => [stationId, unnamedEdge]));
}

export function rowModel(wrapping: Wrapping, row: number): RowModel {
	const { model, rowOf } = wrapping;
	const lines = model.lines.flatMap((line) => lineInRow(line, wrapping, row));
	const giverOf = new Map<string, string>();
	const handovers = handoversInRow(wrapping, row, giverOf);
	const stations = { ...model.stations, ...edgeStations(lines, rowOf) };
	const leavingStops = lines.map((line) => line.stops.at(-1) ?? '').filter(isLeavingStop);
	return { model: { lines, stations, handovers }, leavingStops, giverOf };
}

export function realGiverOf(row: RowModel, from: string, to: string): string {
	return row.giverOf.get(branchKey(from, to)) ?? from;
}
