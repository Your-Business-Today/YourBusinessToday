import type { PlanePoint, Ring } from './pointInPolygon';

/** A closed triangle, first point repeated last: the fewest points a ring can keep and still enclose anything. */
const fewestPointsInARing = 4;

type Span = { first: number; last: number };
type Farthest = { index: number; distance: number };

/**
 * The ring with every vertex dropped that lies within the tolerance of the line between the vertices kept around it,
 * by Douglas and Peucker; a ring too small to survive the tolerance comes back empty.
 */
export function simplifyRing(ring: Ring, tolerance: number): Ring {
	if (ring.length <= fewestPointsInARing) return ring;
	const isKept = ring.map((_, index) => index === 0 || index === ring.length - 1);
	const spans: Span[] = [{ first: 0, last: ring.length - 1 }];
	for (let span = spans.pop(); span !== undefined; span = spans.pop()) {
		const farthest = farthestWithin(ring, span);
		if (farthest.distance <= tolerance) continue;
		isKept[farthest.index] = true;
		spans.push({ first: span.first, last: farthest.index }, { first: farthest.index, last: span.last });
	}
	const simplified = ring.filter((_, index) => isKept[index]);
	return simplified.length < fewestPointsInARing ? [] : simplified;
}

/** The polygon with each ring simplified; empty when its outer ring does not survive, and without the holes that do not. */
export function simplifyPolygon(polygon: Ring[], tolerance: number): Ring[] {
	const [outer, ...holes] = polygon.map((ring) => simplifyRing(ring, tolerance));
	if (outer === undefined || outer.length === 0) return [];
	return [outer, ...holes.filter((hole) => hole.length > 0)];
}

function farthestWithin(ring: Ring, span: Span): Farthest {
	const farthest: Farthest = { index: span.first, distance: 0 };
	for (let index = span.first + 1; index < span.last; index += 1) {
		const distance = distanceFromSegment(ring[index], ring[span.first], ring[span.last]);
		if (distance <= farthest.distance) continue;
		farthest.index = index;
		farthest.distance = distance;
	}
	return farthest;
}

function distanceFromSegment([x, y]: PlanePoint, [startX, startY]: PlanePoint, [endX, endY]: PlanePoint): number {
	const alongX = endX - startX;
	const alongY = endY - startY;
	const lengthSquared = alongX * alongX + alongY * alongY;
	const share = lengthSquared === 0 ? 0 : ((x - startX) * alongX + (y - startY) * alongY) / lengthSquared;
	const clampedShare = Math.min(1, Math.max(0, share));
	return Math.hypot(x - (startX + clampedShare * alongX), y - (startY + clampedShare * alongY));
}
