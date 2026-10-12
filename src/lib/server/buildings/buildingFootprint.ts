import { areaOf, boundsOf, centroidOf } from '$lib/data/polygonMeasures';
import { toCoordinates } from '$lib/data/britishNationalGrid';
import type { Coordinates } from '$lib/data/distance';
import type { PlanePoint, Ring } from '$lib/data/pointInPolygon';

/** A building footprint as the loader holds it: on the grid for the geometry, and on the ground for the map. */
export type Footprint = {
	rings: Ring[];
	bounds: { minX: number; minY: number; maxX: number; maxY: number };
	centre: PlanePoint;
	centreOnGround: Coordinates;
	areaSquareMetres: number;
	geoJson: GeoJSON.Polygon;
};

export function footprintOf(rings: Ring[]): Footprint {
	const [outer] = rings;
	const centre = centroidOf(outer);
	return {
		rings,
		bounds: boundsOf(rings),
		centre,
		centreOnGround: toCoordinates({ eastings: centre[0], northings: centre[1] }),
		areaSquareMetres: Math.round(areaOf(outer)),
		geoJson: { type: 'Polygon', coordinates: rings.map((ring) => ring.map(toLongitudeLatitude)) }
	};
}

function toLongitudeLatitude([eastings, northings]: PlanePoint): [number, number] {
	const { latitude, longitude } = toCoordinates({ eastings, northings });
	return [longitude, latitude];
}
