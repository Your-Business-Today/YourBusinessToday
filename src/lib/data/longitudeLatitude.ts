import { toCoordinates } from './britishNationalGrid';
import type { PlanePoint } from './pointInPolygon';

/** A grid point as GeoJSON places it on the ground: longitude first, then latitude. */
export function toLongitudeLatitude([eastings, northings]: PlanePoint): [number, number] {
	const { latitude, longitude } = toCoordinates({ eastings, northings });
	return [longitude, latitude];
}
