import { DatabaseSync } from 'node:sqlite';
import { ringsInGeoPackageBlob } from './geoPackageGeometry';
import type { Ring } from '$lib/data/pointInPolygon';

/** A box on the grid, in metres. */
export type GridBounds = { minEast: number; minNorth: number; maxEast: number; maxNorth: number };

const buildingTable = /building/i;
const featureLayers = "select table_name from gpkg_contents where data_type = 'features'";
const geometryColumnOf = 'select column_name from gpkg_geometry_columns where table_name = ?';

/** The rings of every building footprint in the box, from each building layer of an OS OpenMap Local GeoPackage. */
export function* readOpenMapBuildings(geoPackagePath: string, bounds: GridBounds): Generator<Ring[]> {
	const database = new DatabaseSync(geoPackagePath, { readOnly: true });
	try {
		for (const table of buildingLayersIn(database)) yield* footprintsIn(database, table, bounds);
	} finally {
		database.close();
	}
}

function buildingLayersIn(database: DatabaseSync): string[] {
	const rows = database.prepare(featureLayers).all() as { table_name: string }[];
	return rows.map((row) => row.table_name).filter((name) => buildingTable.test(name));
}

function* footprintsIn(database: DatabaseSync, table: string, bounds: GridBounds): Generator<Ring[]> {
	const geometryRow = database.prepare(geometryColumnOf).get(table) as { column_name: string } | undefined;
	const geometry = geometryRow?.column_name ?? 'geom';
	const query = hasSpatialIndex(database, table, geometry) ? indexedQuery(table, geometry) : scanQuery(table, geometry);
	const rows = database.prepare(query).iterate(bounds.maxEast, bounds.minEast, bounds.maxNorth, bounds.minNorth) as Iterable<{ blob: Uint8Array }>;
	for (const row of rows) {
		for (const rings of ringsInGeoPackageBlob(row.blob)) yield rings;
	}
}

function hasSpatialIndex(database: DatabaseSync, table: string, geometry: string): boolean {
	const row = database.prepare("select 1 as found from sqlite_master where name = ?").get(`rtree_${table}_${geometry}`);
	return row !== undefined;
}

function indexedQuery(table: string, geometry: string): string {
	return `select "${geometry}" as blob from "${table}" where rowid in (select id from "rtree_${table}_${geometry}" where minx <= ? and maxx >= ? and miny <= ? and maxy >= ?)`;
}

/** Without an index every row is read and the box is applied to the envelope in each geometry's header. */
function scanQuery(table: string, geometry: string): string {
	return `select "${geometry}" as blob from "${table}" where ? >= 0 and ? >= 0 and ? >= 0 and ? >= 0`;
}
