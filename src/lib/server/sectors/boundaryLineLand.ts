import { DatabaseSync } from 'node:sqlite';
import { featureLayersMatching, geometryColumnOf } from '$lib/server/geoPackage/geoPackageLayers';
import { ringsInGeoPackageBlob } from '$lib/server/buildings/geoPackageGeometry';
import type { Ring } from '$lib/data/pointInPolygon';

/** England, Scotland and Wales together are Great Britain: Boundary-Line's country layer, on the National Grid. */
const countryLayer = /^country_region$/i;

/** Every polygon of Great Britain's land, holes included, from the OS Boundary-Line GeoPackage. */
export function* readGreatBritainLand(boundaryLinePath: string): Generator<Ring[]> {
	const database = new DatabaseSync(boundaryLinePath, { readOnly: true });
	try {
		const layers = featureLayersMatching(database, countryLayer);
		if (layers.length === 0) throw new Error(`${boundaryLinePath} has no country_region layer: is it the Boundary-Line GeoPackage?`);
		for (const table of layers) yield* polygonsIn(database, table);
	} finally {
		database.close();
	}
}

function* polygonsIn(database: DatabaseSync, table: string): Generator<Ring[]> {
	const geometry = geometryColumnOf(database, table);
	const rows = database.prepare(`select "${geometry}" as blob from "${table}"`).iterate() as Iterable<{ blob: Uint8Array }>;
	for (const row of rows) yield* ringsInGeoPackageBlob(row.blob);
}
