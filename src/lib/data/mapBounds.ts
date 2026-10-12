/** The edges of what a map shows, in degrees. */
export type MapBounds = { north: number; south: number; east: number; west: number };

const edges = ['north', 'south', 'east', 'west'] as const;
const widestDegrees = 0.2;

export const mapBoundsRefusal = 'The bounds are north, south, east and west in degrees, at most a fifth of a degree across.';

/** The bounds in the query, or null when they are not four degrees the map could show. */
export function readMapBounds(searchParams: URLSearchParams): MapBounds | null {
	const values = edges.map((edge) => Number(searchParams.get(edge)));
	if (values.some(Number.isNaN)) return null;
	const [north, south, east, west] = values;
	const bounds = { north, south, east, west };
	return validateMapBounds(bounds) === null ? bounds : null;
}

/** Why the bounds cannot be asked for, or null when they are a box the map could show. */
export function validateMapBounds(bounds: MapBounds): string | null {
	const isUpsideDown = bounds.north <= bounds.south || bounds.east <= bounds.west;
	const isTooWide = bounds.north - bounds.south > widestDegrees || bounds.east - bounds.west > widestDegrees;
	if (isUpsideDown || isTooWide) return mapBoundsRefusal;
	return null;
}

export function mapBoundsQuery(bounds: MapBounds): string {
	return new URLSearchParams(edges.map((edge) => [edge, String(bounds[edge])])).toString();
}
