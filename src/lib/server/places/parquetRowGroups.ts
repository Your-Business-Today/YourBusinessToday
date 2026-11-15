import { leafPathOf } from './parquetLeaves';
import type { FileMetaData, RowGroup } from 'hyparquet';
import type { MapBounds } from '$lib/data/mapBounds';

/** The rows of a file one row group holds: from its first row to the one after its last. */
export type RowRange = { rowStart: number; rowEnd: number };

type Span = { smallest: number; largest: number };

const longitudeLeaf = 'bbox.xmin';
const latitudeLeaf = 'bbox.ymin';

/**
 * The row groups that could hold a point in the box, by the smallest and largest corner each group says it holds.
 * A group that does not say is kept: reading too much costs time, and reading too little loses places without a word.
 */
export function rowRangesOverlapping(metadata: FileMetaData, bounds: MapBounds): RowRange[] {
	const ranges: RowRange[] = [];
	let rowStart = 0;
	for (const group of metadata.row_groups) {
		const rowEnd = rowStart + Number(group.num_rows);
		if (couldHoldPointIn(group, bounds)) ranges.push({ rowStart, rowEnd });
		rowStart = rowEnd;
	}
	return ranges;
}

function couldHoldPointIn(group: RowGroup, bounds: MapBounds): boolean {
	const longitudes = spanOf(group, longitudeLeaf);
	const latitudes = spanOf(group, latitudeLeaf);
	if (longitudes === null || latitudes === null) return true;
	const isBesideTheBox = longitudes.smallest > bounds.east || longitudes.largest < bounds.west;
	const isAboveOrBelow = latitudes.smallest > bounds.north || latitudes.largest < bounds.south;
	return !isBesideTheBox && !isAboveOrBelow;
}

function spanOf(group: RowGroup, leaf: string): Span | null {
	const chunk = group.columns.find((candidate) => leafPathOf(candidate) === leaf);
	const { statistics } = chunk?.meta_data ?? {};
	const { min_value: smallest, max_value: largest } = statistics ?? {};
	if (typeof smallest !== 'number' || typeof largest !== 'number') return null;
	return { smallest, largest };
}
