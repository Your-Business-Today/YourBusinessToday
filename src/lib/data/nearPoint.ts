import type { Coordinates } from './distance';

const nearParameter = 'near';
const partsInAPoint = 2;

/** The point a map was clicked at, carried in the address as near=latitude,longitude. */
export function readNearPoint(searchParams: URLSearchParams): Coordinates | null {
	const parts = (searchParams.get(nearParameter) ?? '').split(',');
	if (parts.length !== partsInAPoint) return null;
	const [latitude, longitude] = parts.map(Number);
	if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;
	return { latitude, longitude };
}

export function describeNearQuery(point: Coordinates): string {
	const query = new URLSearchParams({ [nearParameter]: `${point.latitude},${point.longitude}` });
	return query.toString();
}
