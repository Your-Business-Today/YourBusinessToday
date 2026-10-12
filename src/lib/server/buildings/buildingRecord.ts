import type { Coordinates } from '$lib/data/distance';

/** A building as the map and the panel hold it: its footprint, its centre, how many places it holds, and its nearest postcode. */
export type Building = Coordinates & {
	id: string;
	footprint: GeoJSON.Polygon;
	areaSquareMetres: number;
	uprnCount: number;
	nearestPostcode: string;
	postcodeDistanceMetres: number | null;
	sector: string;
};

export const buildingColumns =
	'id, footprint, centre_latitude, centre_longitude, area_square_metres, uprn_count, nearest_postcode, postcode_distance_metres, sector';

export function parseBuildingRecord(row: Record<string, unknown>): Building {
	return {
		id: row.id as string,
		footprint: row.footprint as GeoJSON.Polygon,
		latitude: Number(row.centre_latitude),
		longitude: Number(row.centre_longitude),
		areaSquareMetres: Number(row.area_square_metres ?? 0),
		uprnCount: Number(row.uprn_count ?? 0),
		nearestPostcode: (row.nearest_postcode ?? '') as string,
		postcodeDistanceMetres: (row.postcode_distance_metres ?? null) as number | null,
		sector: (row.sector ?? '') as string
	};
}
