import { milesToMetres } from './mapRadii';
import type { Coordinates } from './distance';
import type { MapBounds } from './mapBounds';

const metresPerDegreeLatitude = 111_320;

/** The box on the ground that holds the patch's circle, in degrees. */
export function patchBoundsOnGround(centre: Coordinates, radiusMiles: number): MapBounds {
	const radiusMetres = milesToMetres(radiusMiles);
	const latitudeDegrees = radiusMetres / metresPerDegreeLatitude;
	const longitudeDegrees = radiusMetres / (metresPerDegreeLatitude * Math.cos((centre.latitude * Math.PI) / 180));
	return {
		north: centre.latitude + latitudeDegrees,
		south: centre.latitude - latitudeDegrees,
		east: centre.longitude + longitudeDegrees,
		west: centre.longitude - longitudeDegrees
	};
}
