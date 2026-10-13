import type { DatabaseSync } from 'node:sqlite';

const featureLayers = "select table_name from gpkg_contents where data_type = 'features'";
const geometryColumnQuery = 'select column_name from gpkg_geometry_columns where table_name = ?';
const usualGeometryColumn = 'geom';

/** The feature layers of a GeoPackage whose names match the pattern. */
export function featureLayersMatching(database: DatabaseSync, pattern: RegExp): string[] {
	const rows = database.prepare(featureLayers).all() as { table_name: string }[];
	return rows.map((row) => row.table_name).filter((name) => pattern.test(name));
}

/** The column a layer keeps its geometry in, as the GeoPackage registers it. */
export function geometryColumnOf(database: DatabaseSync, table: string): string {
	const row = database.prepare(geometryColumnQuery).get(table) as { column_name: string } | undefined;
	return row?.column_name ?? usualGeometryColumn;
}
