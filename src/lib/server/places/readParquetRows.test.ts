import { describe, expect, it } from 'vitest';
import { parquetMetadata, parquetReadObjects } from 'hyparquet';
import { columnsOfLeaves, keepOnlyLeaves, leafPathOf } from './parquetLeaves';
import { placeLeaves, removedPlaceLeaves, type OverturePlace } from './overturePlace';
import { placesFileOf } from './placesParquet.fixture';
import { readRowsAcross } from './readParquetRows';
import { rowRangesOverlapping } from './parquetRowGroups';

const surbiton = { west: -0.38, east: -0.24, south: 51.34, north: 51.43 };
const inSurbiton = { longitude: -0.3045, latitude: 51.3925 };
const inParis = { longitude: 2.35, latitude: 48.85 };
const twoToAGroup = 2;

const mixedFile = placesFileOf(
	[
		{ id: 'paris-1', ...inParis },
		{ id: 'paris-2', ...inParis },
		{ id: 'lamb', ...inSurbiton },
		{ id: 'paris-3', ...inParis },
		{ id: 'paris-4', ...inParis }
	],
	twoToAGroup
);
const parisFile = placesFileOf([{ id: 'paris-5', ...inParis }], twoToAGroup);

const idsOf = (rows: OverturePlace[]) => rows.map((row) => row.id);

describe('choosing the row groups worth reading', () => {
	it('keeps only the groups whose corners could lie in the box, by what each group says it holds', () => {
		expect(rowRangesOverlapping(parquetMetadata(mixedFile), surbiton)).toEqual([{ rowStart: 2, rowEnd: 4 }]);
	});

	it('keeps no group of a file that holds nothing near the box', () => {
		expect(rowRangesOverlapping(parquetMetadata(parisFile), surbiton)).toEqual([]);
	});

	it('keeps a group that does not say what it holds, so nothing is lost without a word', () => {
		const metadata = parquetMetadata(mixedFile);
		const groups = metadata.row_groups;
		const silent = { ...metadata, row_groups: groups.map((group) => ({ ...group, columns: group.columns.map((chunk) => ({ ...chunk, meta_data: undefined })) })) };
		expect(rowRangesOverlapping(silent, surbiton)).toHaveLength(groups.length);
	});
});

describe('narrowing a footer to the leaves asked for', () => {
	it('leaves a reader only those leaves to fetch, and the rows come out whole', async () => {
		const narrowed = keepOnlyLeaves(parquetMetadata(mixedFile), placeLeaves);
		const [firstGroup] = narrowed.row_groups;
		expect(firstGroup.columns.map(leafPathOf)).toEqual(['id', 'bbox.xmin', 'bbox.ymin', 'names.primary', 'taxonomy.primary', 'websites.list.element', 'phones.list.element', 'confidence', 'addresses.list.element.freeform', 'addresses.list.element.postcode', 'sources.list.element.license', 'operating_status']);
		const [, , lamb] = (await parquetReadObjects({ file: mixedFile, metadata: narrowed, columns: columnsOfLeaves(placeLeaves) })) as OverturePlace[];
		expect(lamb).toEqual({
			id: 'lamb',
			bbox: { xmin: -0.3045, ymin: 51.3925 },
			names: { primary: 'The Lamb' },
			taxonomy: { primary: 'pub' },
			websites: ['https://thelamb.example/'],
			phones: ['+442083990000'],
			confidence: 0.95,
			addresses: [{ freeform: '73 Brighton Road', postcode: 'KT6 5NF' }],
			sources: [{ license: 'CDLA-Permissive-2.0' }],
			operating_status: 'open'
		});
	});

	it('refuses by name a leaf the file does not carry, since rows read without it would only look empty', () => {
		expect(() => keepOnlyLeaves(parquetMetadata(mixedFile), ['id', 'names.common', 'emails.list.element'])).toThrow('The file carries no column names.common, emails.list.element: its layout has changed');
	});
});

describe('reading the rows of several files', () => {
	it('reads the groups that could hold a point in the box and hands every row of them to be kept or not', async () => {
		const rows = await readRowsAcross<OverturePlace, OverturePlace>([parisFile, mixedFile], { leaves: removedPlaceLeaves, bounds: surbiton }, (row) => row);
		expect(idsOf(rows)).toEqual(['lamb', 'paris-3']);
		expect(rows[0]).toEqual({ id: 'lamb', bbox: { xmin: -0.3045, ymin: 51.3925 } });
	});

	it('keeps only what it is told to keep', async () => {
		const rows = await readRowsAcross<OverturePlace, string>([mixedFile], { leaves: removedPlaceLeaves, bounds: surbiton }, (row) => (row.id === 'lamb' ? 'lamb' : null));
		expect(rows).toEqual(['lamb']);
	});
});
