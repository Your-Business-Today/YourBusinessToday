import { parquetMetadataAsync, parquetReadObjects, type AsyncBuffer, type FileMetaData } from 'hyparquet';
import { columnsOfLeaves, keepOnlyLeaves } from './parquetLeaves';
import { compressors } from 'hyparquet-compressors';
import { eachBatchInTurn } from '$lib/data/inBatches';
import { rowRangesOverlapping, type RowRange } from './parquetRowGroups';
import type { MapBounds } from '$lib/data/mapBounds';

/** A parquet file worth reading: its footer narrowed to the leaves asked for, and the row groups that could hold a point in the box. */
export type OpenedParquet = { file: AsyncBuffer; metadata: FileMetaData; ranges: RowRange[] };

/** What a read asks of a set of files: the leaves by their dotted paths, and the box on the ground. */
export type RowsAsked = { leaves: string[]; bounds: MapBounds };

/** Enough of a file's end to hold its footer in one request: the footer of a places file runs to three megabytes. */
const footerFetchBytes = 4 * 1024 * 1024;
/** Footers read together: each is some twenty megabytes once read, and is let go as soon as its row groups are chosen. */
const footersAtOnce = 4;

/** The file's footer and, from it alone, the row groups worth reading: nothing if none is, so the footer is let go. */
export async function openParquetIn(file: AsyncBuffer, asked: RowsAsked): Promise<OpenedParquet[]> {
	const metadata = await parquetMetadataAsync(file, { initialFetchSize: footerFetchBytes });
	const ranges = rowRangesOverlapping(metadata, asked.bounds);
	return ranges.length === 0 ? [] : [{ file, metadata: keepOnlyLeaves(metadata, asked.leaves), ranges }];
}

/**
 * What `keep` makes of each row in the row groups worth reading. A row group is read alone and let go before the
 * next, because the rows of several do not fit in a function's memory at once. The caller says what a row of the
 * leaves it asked for looks like: a parquet file's rows come with no type of their own.
 */
export async function readOpenedRows<Row, Kept>(opened: OpenedParquet, leaves: string[], keep: (row: Row) => Kept | null): Promise<Kept[]> {
	const { file, metadata, ranges } = opened;
	const columns = columnsOfLeaves(leaves);
	const kept: Kept[] = [];
	for (const range of ranges) {
		const rows = (await parquetReadObjects({ file, metadata, columns, compressors, ...range })) as Row[];
		for (const row of rows) {
			const one = keep(row);
			if (one !== null) kept.push(one);
		}
	}
	return kept;
}

/** What `keep` makes of the rows of several files: the footers are read a few together, then the row groups one at a time. */
export async function readRowsAcross<Row, Kept>(files: AsyncBuffer[], asked: RowsAsked, keep: (row: Row) => Kept | null): Promise<Kept[]> {
	const opened = await eachBatchInTurn(files, footersAtOnce, async (batch) => (await Promise.all(batch.map((file) => openParquetIn(file, asked)))).flat());
	const kept: Kept[] = [];
	for (const one of opened) {
		const rows = await readOpenedRows(one, asked.leaves, keep);
		for (const row of rows) kept.push(row);
	}
	return kept;
}
