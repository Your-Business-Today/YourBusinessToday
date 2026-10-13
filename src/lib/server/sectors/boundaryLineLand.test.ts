import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { afterAll, describe, expect, it } from 'vitest';
import { readGreatBritainLand } from './boundaryLineLand';
import type { Ring } from '$lib/data/pointInPolygon';

const britishNationalGrid = 27700;
const wkbPolygon = 3;
const littleEndianWithoutEnvelope = 1;

/** A GeoPackage geometry: the GP header with no envelope, then one polygon in little-endian well-known binary. */
function geoPackagePolygon(ring: Ring): Uint8Array {
	const view = new DataView(new ArrayBuffer(8 + 13 + ring.length * 16));
	[0x47, 0x50, 0, littleEndianWithoutEnvelope].forEach((byte, at) => view.setUint8(at, byte));
	view.setInt32(4, britishNationalGrid, true);
	view.setUint8(8, 1);
	view.setUint32(9, wkbPolygon, true);
	view.setUint32(13, 1, true);
	view.setUint32(17, ring.length, true);
	ring.forEach(([x, y], index) => {
		view.setFloat64(21 + index * 16, x, true);
		view.setFloat64(29 + index * 16, y, true);
	});
	return new Uint8Array(view.buffer);
}

const folder = mkdtempSync(join(tmpdir(), 'boundary-line-'));
const square: Ring = [[0, 0], [100, 0], [100, 100], [0, 100], [0, 0]];

function writeBoundaryLine(path: string, layer: string): void {
	const database = new DatabaseSync(path);
	database.exec('create table gpkg_contents (table_name text, data_type text)');
	database.exec('create table gpkg_geometry_columns (table_name text, column_name text)');
	database.exec(`create table ${layer} (fid integer primary key, geometry blob)`);
	database.prepare("insert into gpkg_contents values (?, 'features')").run(layer);
	database.prepare("insert into gpkg_geometry_columns values (?, 'geometry')").run(layer);
	database.prepare(`insert into ${layer} (geometry) values (?)`).run(geoPackagePolygon(square));
	database.close();
}

afterAll(() => rmSync(folder, { recursive: true }));

describe('readGreatBritainLand', () => {
	it('reads every polygon of the country layer', () => {
		const path = join(folder, 'bdline_gb.gpkg');
		writeBoundaryLine(path, 'country_region');
		expect([...readGreatBritainLand(path)]).toEqual([[square]]);
	});

	it('refuses a GeoPackage with no country layer', () => {
		const path = join(folder, 'opmplc_gb.gpkg');
		writeBoundaryLine(path, 'building');
		expect(() => [...readGreatBritainLand(path)]).toThrow(/no country_region layer/);
	});
});
