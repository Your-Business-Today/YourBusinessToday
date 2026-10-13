import type { PlanePoint, Ring } from './pointInPolygon';

/** The area a ring encloses, in the plane's own units squared, by the shoelace. */
export function areaOf(ring: Ring): number {
	let twiceArea = 0;
	for (let at = 0, before = ring.length - 1; at < ring.length; before = at, at += 1) {
		const [xAt, yAt] = ring[at];
		const [xBefore, yBefore] = ring[before];
		twiceArea += xBefore * yAt - xAt * yBefore;
	}
	return Math.abs(twiceArea) / 2;
}

/** The ring's centre of area, falling back to the mean of its vertices for a degenerate ring. */
export function centroidOf(ring: Ring): PlanePoint {
	let twiceArea = 0;
	let x = 0;
	let y = 0;
	for (let at = 0, before = ring.length - 1; at < ring.length; before = at, at += 1) {
		const [xAt, yAt] = ring[at];
		const [xBefore, yBefore] = ring[before];
		const cross = xBefore * yAt - xAt * yBefore;
		twiceArea += cross;
		x += (xBefore + xAt) * cross;
		y += (yBefore + yAt) * cross;
	}
	if (twiceArea === 0) return meanOf(ring);
	return [x / (3 * twiceArea), y / (3 * twiceArea)];
}

function meanOf(ring: Ring): PlanePoint {
	const count = ring.length || 1;
	return [ring.reduce((sum, [x]) => sum + x, 0) / count, ring.reduce((sum, [, y]) => sum + y, 0) / count];
}

/** A box in the plane, by its least and greatest x and y. */
export type PlaneBox = { minX: number; minY: number; maxX: number; maxY: number };

/** The smallest box around every ring, read point by point so a coastline of any length fits. */
export function boundsOf(rings: Ring[]): PlaneBox {
	const box = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
	for (const ring of rings) {
		for (const [x, y] of ring) {
			box.minX = Math.min(box.minX, x);
			box.minY = Math.min(box.minY, y);
			box.maxX = Math.max(box.maxX, x);
			box.maxY = Math.max(box.maxY, y);
		}
	}
	return box;
}

export function boxesOverlap(first: PlaneBox, second: PlaneBox): boolean {
	return first.minX <= second.maxX && second.minX <= first.maxX && first.minY <= second.maxY && second.minY <= first.maxY;
}
