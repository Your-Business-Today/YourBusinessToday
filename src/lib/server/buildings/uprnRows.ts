import type { GridPoint } from '$lib/data/britishNationalGrid';
import type { Coordinates } from '$lib/data/distance';
import type { GridBounds } from './openMapBuildings';

/** One addressable place as OS Open UPRN lists it: the number, and where it is on the grid and the ground. */
export type UprnPoint = GridPoint & Coordinates & { uprn: number };

const fieldsInARow = 5;
const uprnField = 0;
const eastingsField = 1;
const northingsField = 2;
const latitudeField = 3;
const longitudeField = 4;

/** A row of the Open UPRN file inside the box, or null for the heading, a malformed row, or one outside it. */
export function readUprnPoint(record: string[], bounds: GridBounds): UprnPoint | null {
	if (record.length !== fieldsInARow) return null;
	const numbers = record.map(Number);
	if (numbers.some(Number.isNaN)) return null;
	const [uprn, eastings, northings, latitude, longitude] = [numbers[uprnField], numbers[eastingsField], numbers[northingsField], numbers[latitudeField], numbers[longitudeField]];
	const isInside = eastings >= bounds.minEast && eastings <= bounds.maxEast && northings >= bounds.minNorth && northings <= bounds.maxNorth;
	if (!isInside) return null;
	return { uprn, eastings, northings, latitude, longitude };
}
