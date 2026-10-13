import { areaOf, boundsOf, centroidOf, type PlaneBox } from '$lib/data/polygonMeasures';
import { toCoordinates } from '$lib/data/britishNationalGrid';
import { toLongitudeLatitude } from '$lib/data/longitudeLatitude';
import type { Coordinates } from '$lib/data/distance';
import type { PlanePoint, Ring } from '$lib/data/pointInPolygon';

/** A building footprint as the loader holds it: on the grid for the geometry, and on the ground for the map. */
export type Footprint = {
	rings: Ring[];
	bounds: PlaneBox;
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
