import type { MapBounds } from '$lib/data/mapBounds';

export const overtureBucket = 's3://overturemaps-us-west-2';
export const overtureRegion = 'us-west-2';

/** Where a release's places and its changelog live; a test points these at local parquet files instead. */
export function placesPathFor(release: string): string {
	return `${overtureBucket}/release/${release}/theme=places/type=place/*`;
}

export function changelogPathFor(release: string): string {
	return `${overtureBucket}/changelog/${release}/theme=places/type=place/*`;
}

/** Every place in the box with the columns the premises row takes; the point is read from the bbox, so no spatial extension is needed.
 * The category is the taxonomy's primary entry: the September 2026 release removed the older categories column. */
export function placesInBoundsQuery(parquetPath: string, bounds: MapBounds): string {
	return [
		'select id,',
		'  names.primary as name,',
		'  taxonomy.primary as category,',
		'  list_extract(websites, 1) as website,',
		'  list_extract(phones, 1) as phone,',
		'  confidence,',
		'  list_extract(addresses, 1).freeform as address,',
		'  list_extract(addresses, 1).postcode as postcode,',
		'  bbox.xmin as longitude,',
		'  bbox.ymin as latitude,',
		'  coalesce(list_extract(sources, 1).license, \'\') as licence',
		`from read_parquet('${parquetPath}', hive_partitioning = 1)`,
		`where bbox.xmin between ${bounds.west} and ${bounds.east}`,
		`  and bbox.ymin between ${bounds.south} and ${bounds.north}`
	].join('\n');
}

/** The ids the release's changelog says were removed, among the ids given. */
export function removedPlacesQuery(parquetPath: string, ids: string[]): string {
	const list = ids.map((id) => `'${id.replace(/'/g, "''")}'`).join(', ');
	return `select id from read_parquet('${parquetPath}', hive_partitioning = 1) where change_type = 'removed' and id in (${list})`;
}
