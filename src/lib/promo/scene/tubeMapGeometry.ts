import { CurvePath, LineCurve3, QuadraticBezierCurve3, TubeGeometry, Vector3 } from 'three';
import type { MapLine } from './tubeMapLayout';
import { offsetFrom, promoSets } from './promoSets';

export const trackShape = { radius: 0.32, segments: 240, sides: 10, cornerRadius: 3, height: 0.35 };

const indicesPerQuad = 6;

function stopPoint(stop: [number, number]): Vector3 {
	const [x, z] = stop;
	return offsetFrom(promoSets.map, x, trackShape.height, z);
}

function towards(from: Vector3, to: Vector3, distance: number): Vector3 {
	const direction = to.clone().sub(from).normalize();
	return from.clone().addScaledVector(direction, distance);
}

function cornerRadiusAt(previous: Vector3, corner: Vector3, next: Vector3): number {
	const shortestHalf = Math.min(previous.distanceTo(corner), corner.distanceTo(next)) / 2;
	return Math.min(trackShape.cornerRadius, shortestHalf);
}

/** A line's route with its corners rounded, the way a tube map turns them. */
export function trackPath(line: MapLine): CurvePath<Vector3> {
	const points = line.stops.map(stopPoint);
	const path = new CurvePath<Vector3>();
	let segmentStart = points[0];
	for (let index = 1; index < points.length - 1; index += 1) {
		const corner = points[index];
		const radius = cornerRadiusAt(points[index - 1], corner, points[index + 1]);
		const cornerEntry = towards(corner, points[index - 1], radius);
		const cornerExit = towards(corner, points[index + 1], radius);
		path.add(new LineCurve3(segmentStart, cornerEntry));
		path.add(new QuadraticBezierCurve3(cornerEntry, corner, cornerExit));
		segmentStart = cornerExit;
	}
	path.add(new LineCurve3(segmentStart, points[points.length - 1]));
	return path;
}

export function trackGeometry(path: CurvePath<Vector3>, radius: number): TubeGeometry {
	return new TubeGeometry(path, trackShape.segments, radius, trackShape.sides, false);
}

/** How many indices draw the first part of a track, so it can be drawn on bit by bit. */
export function indicesForShare(share: number): number {
	const drawnSegments = Math.round(share * trackShape.segments);
	return drawnSegments * trackShape.sides * indicesPerQuad;
}
