import type { LineMapLayout } from './lineMapLayout';
import { crossingsAfter, rowsOfStations, type Timeline } from './rowCuts';
import { rowLayout, type LayoutSettings } from './rowLayout';
import { rowModel, type RowModel } from './rowModel';
import type { LaidOutRow } from './stackedRows';
import type { Columns } from './stationColumns';

export type Filling = { timeline: Timeline; settings: LayoutSettings; widestRow: number };

const RowPlaces = { earlier: 0, this: 1, later: 2 } as const;

function leavingAtTheEdge(piece: RowModel, settings: LayoutSettings): LineMapLayout {
	const { model, leavingStops } = piece;
	const first = rowLayout(model, model.handovers, settings);
	const lastColumn = Math.max(...Object.values(first.columns));
	const isEveryLineLeavingAtTheEdge = leavingStops.every((stationId) => first.columns[stationId] === lastColumn);
	if (isEveryLineLeavingAtTheEdge) return first;
	const floors: Columns = Object.fromEntries(leavingStops.map((stationId) => [stationId, lastColumn]));
	return rowLayout(model, model.handovers, settings, floors);
}

/** One row laid out on its own, given which row each station falls in. */
export function laidOutRow(filling: Filling, rowOf: Record<string, number>, row: number): LaidOutRow {
	const { model, forward } = filling.timeline;
	const piece = rowModel({ model, forward, rowOf }, row);
	return { piece, layout: leavingAtTheEdge(piece, filling.settings) };
}

function widthOfColumns(filling: Filling, first: number, last: number): number {
	const placeOf = (column: number) => (column < first ? RowPlaces.earlier : column > last ? RowPlaces.later : RowPlaces.this);
	const { columns } = filling.timeline;
	const rowOf = Object.fromEntries(Object.entries(columns).map(([stationId, column]) => [stationId, placeOf(column)]));
	const { layout } = laidOutRow(filling, rowOf, RowPlaces.this);
	return layout.width;
}

function lastColumnThatFits(filling: Filling, first: number, lastColumn: number): number {
	let last = first;
	while (last < lastColumn && widthOfColumns(filling, first, last + 1) <= filling.widestRow) last += 1;
	return last;
}

/** Where the row starting at a column ends: as late as it fits, pulled back to where the fewest lines and hand-overs carry on. */
export function rowEnd(filling: Filling, first: number, lastColumn: number): number {
	const latest = lastColumnThatFits(filling, first, lastColumn);
	if (latest === lastColumn) return latest;
	const earliest = Math.max(first, latest - Math.floor((latest - first + 1) / 3));
	const candidates = Array.from({ length: latest - earliest + 1 }, (_, index) => latest - index);
	const costOf = (column: number) => crossingsAfter(column, filling.timeline);
	return candidates.reduce((best, column) => (costOf(column) < costOf(best) ? column : best));
}

export function rowsOfFilling(filling: Filling, cuts: number[]): LaidOutRow[] {
	const { columns } = filling.timeline;
	const rowOf = rowsOfStations(columns, cuts);
	return Array.from({ length: cuts.length + 1 }, (_, row) => laidOutRow(filling, rowOf, row));
}
