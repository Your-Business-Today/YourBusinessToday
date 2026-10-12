import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { DuckDBInstance, type DuckDBConnection } from '@duckdb/node-api';
import { placesInBoundsQuery, removedPlacesQuery } from './overtureQueries';
import { readPlaceRow } from './placeRow';
import { validatePlace } from '$lib/data/placeRules';

/** A parquet file shaped like a release's places partition, written by DuckDB itself, so the query is proven against the engine. */
const placesSql = `
	select 'abc-1' as id,
		{'primary': 'Kingston Osteopaths', 'common': null} as names,
		{'primary': 'osteopath', 'alternate': ['health']} as taxonomy,
		['https://kingston-osteopaths.example'] as websites,
		['+44 20 8000 0000'] as phones,
		0.86 as confidence,
		[{'freeform': '12 Eden Street', 'postcode': 'KT1 1BB', 'locality': 'Kingston'}] as addresses,
		{'xmin': -0.306, 'xmax': -0.305, 'ymin': 51.411, 'ymax': 51.412} as bbox,
		[{'dataset': 'meta', 'license': 'CDLA-Permissive-2.0'}] as sources
	union all
	select 'abc-2', {'primary': 'Far Away', 'common': null}, {'primary': 'cafe', 'alternate': []}, [], [], 0.9,
		[{'freeform': '', 'postcode': '', 'locality': ''}], {'xmin': 1.5, 'xmax': 1.5, 'ymin': 52.5, 'ymax': 52.5}, [{'dataset': 'msft', 'license': 'ODbL'}]
`;
const changelogSql = "select 'abc-9' as id, 'removed' as change_type union all select 'abc-1', 'data_changed'";

let connection: DuckDBConnection;
let folder: string;

beforeAll(async () => {
	folder = mkdtempSync(join(tmpdir(), 'overture-'));
	writeFileSync(join(folder, 'keep'), '');
	const instance = await DuckDBInstance.create(':memory:');
	connection = await instance.connect();
	await connection.run(`copy (${placesSql}) to '${join(folder, 'places.parquet')}' (format parquet)`);
	await connection.run(`copy (${changelogSql}) to '${join(folder, 'changelog.parquet')}' (format parquet)`);
});

afterAll(() => connection.closeSync());

describe('placesInBoundsQuery', () => {
	it('reads the places in the box with the columns the premises row takes', async () => {
		const bounds = { north: 51.5, south: 51.3, east: -0.2, west: -0.4 };
		const reader = await connection.runAndReadAll(placesInBoundsQuery(join(folder, 'places.parquet'), bounds));
		const rows = reader.getRowObjectsJson() as Record<string, unknown>[];
		expect(rows).toHaveLength(1);
		const place = readPlaceRow(rows[0]);
		expect(place).toEqual({
			sourceId: 'abc-1',
			businessName: 'Kingston Osteopaths',
			category: 'osteopath',
			address: '12 Eden Street',
			postcode: 'KT1 1BB',
			latitude: 51.411,
			longitude: -0.306,
			website: 'https://kingston-osteopaths.example',
			phone: '+44 20 8000 0000',
			confidence: 0.86,
			sourceLicence: 'CDLA-Permissive-2.0'
		});
		expect(validatePlace(place!)).toBeNull();
	});

	it('refuses a share-alike row and one below the confidence floor', async () => {
		const bounds = { north: 53, south: 52, east: 2, west: 1 };
		const reader = await connection.runAndReadAll(placesInBoundsQuery(join(folder, 'places.parquet'), bounds));
		const [row] = reader.getRowObjectsJson() as Record<string, unknown>[];
		const place = readPlaceRow(row);
		expect(validatePlace(place!)).toContain('share-alike');
		expect(validatePlace({ ...place!, sourceLicence: '', confidence: 0.5 })).toContain('below');
	});
});

describe('removedPlacesQuery', () => {
	it('finds only the held ids the changelog removed', async () => {
		const reader = await connection.runAndReadAll(removedPlacesQuery(join(folder, 'changelog.parquet'), ['abc-1', 'abc-9', "o'brien"]));
		expect(reader.getRowObjectsJson()).toEqual([{ id: 'abc-9' }]);
	});
});
