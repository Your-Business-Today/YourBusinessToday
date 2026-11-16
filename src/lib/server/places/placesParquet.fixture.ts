import { parquetWriteBuffer } from 'hyparquet-writer';
import type { SchemaElement } from 'hyparquet';
import type { OverturePlace } from './overturePlace';

/** What a test says of a place: where it stands and whatever else matters to it. The rest is a pub in Surbiton. */
export type PlaceFacts = { id: string; longitude: number; latitude: number; name?: string | null; postcode?: string; licences?: string[]; confidence?: number; status?: string };

const text: Partial<SchemaElement> = { type: 'BYTE_ARRAY', converted_type: 'UTF8', repetition_type: 'OPTIONAL' };
const double: Partial<SchemaElement> = { type: 'DOUBLE', repetition_type: 'OPTIONAL' };
const columnNames = ['id', 'bbox', 'names', 'taxonomy', 'websites', 'phones', 'confidence', 'addresses', 'sources', 'operating_status', 'version'];

const group = (name: string, childCount: number): SchemaElement => ({ name, num_children: childCount, repetition_type: 'OPTIONAL' });
const leaf = (name: string, kind: Partial<SchemaElement>): SchemaElement => ({ ...kind, name });
const listOf = (name: string, element: SchemaElement[]): SchemaElement[] => [{ ...group(name, 1), converted_type: 'LIST' }, { name: 'list', num_children: 1, repetition_type: 'REPEATED' }, ...element];

/** The layout of a release's places file, in the columns the site reads and one, the version, it does not. */
const placesSchema: SchemaElement[] = [
	{ name: 'root', num_children: columnNames.length },
	leaf('id', text),
	group('bbox', 4),
	...['xmin', 'xmax', 'ymin', 'ymax'].map((corner) => leaf(corner, double)),
	group('names', 1),
	leaf('primary', text),
	group('taxonomy', 1),
	leaf('primary', text),
	...listOf('websites', [leaf('element', text)]),
	...listOf('phones', [leaf('element', text)]),
	leaf('confidence', double),
	...listOf('addresses', [group('element', 2), leaf('freeform', text), leaf('postcode', text)]),
	...listOf('sources', [group('element', 1), leaf('license', text)]),
	leaf('operating_status', text),
	leaf('version', { type: 'INT32', repetition_type: 'OPTIONAL' })
];

/** A place as a release holds it, from the facts a test gives. */
export function overturePlaceOf(facts: PlaceFacts): OverturePlace & { version: number } {
	const { id, longitude, latitude, name = 'The Lamb', postcode = 'KT6 5NF', licences = ['CDLA-Permissive-2.0'], confidence = 0.95, status = 'open' } = facts;
	return {
		id,
		bbox: { xmin: longitude, xmax: longitude, ymin: latitude, ymax: latitude } as OverturePlace['bbox'],
		names: { primary: name },
		taxonomy: { primary: 'pub' },
		websites: ['https://thelamb.example/'],
		phones: ['+442083990000'],
		confidence,
		addresses: [{ freeform: '73 Brighton Road', postcode }],
		sources: licences.map((license) => ({ license })),
		operating_status: status,
		version: 1
	};
}

/** A places file held in memory, as Overture lays one out: the places in the order given, so many to a row group. */
export function placesFileOf(places: PlaceFacts[], rowsPerGroup: number): ArrayBuffer {
	const rows = places.map(overturePlaceOf) as Record<string, unknown>[];
	const columnData = columnNames.map((name) => ({ name, data: rows.map((row) => row[name]) }));
	return parquetWriteBuffer({ columnData, schema: placesSchema, rowGroupSize: rowsPerGroup });
}
