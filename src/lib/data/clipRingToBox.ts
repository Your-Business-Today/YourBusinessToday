import type { PlaneBox } from './polygonMeasures';
import type { PlanePoint, Ring } from './pointInPolygon';

type Axis = 0 | 1;

/** One side of a box: the axis it is drawn across, where it stands, and which side of it is inside. */
type BoxSide = { axis: Axis; limitOf: (box: PlaneBox) => number; isInsideAbove: boolean };

const boxSides: BoxSide[] = [
	{ axis: 0, limitOf: (box) => box.minX, isInsideAbove: true },
	{ axis: 0, limitOf: (box) => box.maxX, isInsideAbove: false },
	{ axis: 1, limitOf: (box) => box.minY, isInsideAbove: true },
	{ axis: 1, limitOf: (box) => box.maxY, isInsideAbove: false }
];

/**
 * The part of the ring inside the box, by Sutherland and Hodgman: one side of the box at a time.
 * A ring that leaves the box and comes back is joined along the box's edge, enclosing nothing there.
 */
export function clipRingToBox(ring: Ring, box: PlaneBox): Ring {
	return boxSides.reduce((clipped, side) => clipToSide(clipped, side, side.limitOf(box)), ring);
}

function clipToSide(ring: Ring, side: BoxSide, limit: number): Ring {
	const clipped: Ring = [];
	const isInside = (point: PlanePoint) => (side.isInsideAbove ? point[side.axis] >= limit : point[side.axis] <= limit);
	ring.forEach((point, index) => {
		const previous = ring[(index + ring.length - 1) % ring.length];
		const isPointInside = isInside(point);
		const crossesTheSide = isPointInside !== isInside(previous);
		if (crossesTheSide) {
			clipped.push(crossingOf(previous, point, side.axis, limit));
		}
		if (isPointInside) clipped.push(point);
	});
	return clipped;
}

function crossingOf(from: PlanePoint, to: PlanePoint, axis: Axis, limit: number): PlanePoint {
	const share = (limit - from[axis]) / (to[axis] - from[axis]);
	const crossing: PlanePoint = [from[0] + share * (to[0] - from[0]), from[1] + share * (to[1] - from[1])];
	crossing[axis] = limit;
	return crossing;
}
