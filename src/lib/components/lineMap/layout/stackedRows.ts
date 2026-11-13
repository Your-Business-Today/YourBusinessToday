import type { Point } from './lineMapGeometry';
import type { LineMapLayout } from './lineMapLayout';
import { realGiverOf, type RowModel } from './rowModel';

export type LaidOutRow = { piece: RowModel; layout: LineMapLayout };

type Shift<T> = (item: T) => T;

function shiftedRecord<T>(record: Record<string, T>, shift: Shift<T>): Record<string, T> {
	return Object.fromEntries(Object.entries(record).map(([key, item]) => [key, shift(item)]));
}

function rowMovedDown(laidOut: LaidOutRow, top: number, row: number): LineMapLayout {
	const { layout, piece } = laidOut;
	const down = <T extends { y: number }>(item: T): T => ({ ...item, y: item.y + top });
	const corners = (points: Point[]) => points.map(down);
	return {
		...layout,
		places: shiftedRecord(layout.places, (place) => ({ ...down(place), top: place.top + top, foot: place.foot + top })),
		labels: shiftedRecord(layout.labels, down),
		branches: layout.branches.map((branch) => ({ ...branch, from: realGiverOf(piece, branch.from, branch.to), corners: corners(branch.corners) })),
		lineRuns: layout.lineRuns.map((run) => ({ ...down(run), row })),
		lineNames: layout.lineNames.map((lineName) => ({ ...down(lineName), row })),
		rowOfStation: shiftedRecord(layout.rowOfStation, () => row)
	};
}

function topsOf(rows: LaidOutRow[]): number[] {
	const heights = rows.map(({ layout }) => layout.height);
	return heights.map((_, index) => heights.slice(0, index).reduce((sum, height) => sum + height, 0));
}

/** The rows of a wrapped map stacked down the page, one under the other, as one layout. */
export function stackedRows(rows: LaidOutRow[]): LineMapLayout {
	const tops = topsOf(rows);
	const moved = rows.map((laidOut, row) => rowMovedDown(laidOut, tops[row], row));
	const merge = <K extends 'places' | 'labels' | 'columns' | 'rowOfStation'>(key: K) => Object.assign({}, ...moved.map((layout) => layout[key]));
	return {
		geometry: moved[0].geometry,
		laneOrder: [...new Set(moved.flatMap((layout) => layout.laneOrder))],
		columns: merge('columns'),
		places: merge('places'),
		labels: merge('labels'),
		rowOfStation: merge('rowOfStation'),
		branches: moved.flatMap((layout) => layout.branches),
		lineRuns: moved.flatMap((layout) => layout.lineRuns),
		lineNames: moved.flatMap((layout) => layout.lineNames),
		width: Math.max(...moved.map((layout) => layout.width)),
		height: moved.reduce((sum, layout) => sum + layout.height, 0),
		rows: moved.map((layout, row) => ({ top: tops[row], height: layout.height })),
		goingBack: []
	};
}
