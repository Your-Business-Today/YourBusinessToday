import { milesToMetres } from '$lib/data/mapRadii';
import { toGridPoint } from '$lib/data/britishNationalGridForward';
import type { Coordinates } from '$lib/data/distance';
import type { GridBounds } from './openMapBuildings';

/** The square on the grid that holds the patch's circle. */
export function patchGridBounds(centre: Coordinates, radiusMiles: number): GridBounds {
	const { eastings, northings } = toGridPoint(centre);
	const radius = milesToMetres(radiusMiles);
	return { minEast: eastings - radius, minNorth: northings - radius, maxEast: eastings + radius, maxNorth: northings + radius };
}
