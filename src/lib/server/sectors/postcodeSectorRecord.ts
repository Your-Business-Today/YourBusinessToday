import type { Coordinates } from '$lib/data/distance';

/** A postcode sector on the ground: its centroid, how many unit postcodes it holds, and a boundary when one has been drawn. */
export type PostcodeSector = Coordinates & {
	sector: string;
	outcode: string;
	unitPostcodeCount: number;
	boundary: GeoJSON.GeoJsonObject | null;
	boundarySource: string;
};

export const postcodeSectorColumns = 'sector, outcode, latitude, longitude, unit_postcode_count, boundary, boundary_source';

export function parsePostcodeSectorRecord(row: Record<string, unknown>): PostcodeSector {
	return {
		sector: row.sector as string,
		outcode: row.outcode as string,
		latitude: Number(row.latitude),
		longitude: Number(row.longitude),
		unitPostcodeCount: Number(row.unit_postcode_count ?? 0),
		boundary: (row.boundary ?? null) as GeoJSON.GeoJsonObject | null,
		boundarySource: (row.boundary_source ?? '') as string
	};
}
