import type { LineMapGeometry, Point } from './lineMapGeometry';

export function forkCorners(start: Point, end: Point, geometry: LineMapGeometry): Point[] {
	const half = geometry.pitch / 2;
	const fall = Math.sign(end.y - start.y);
	const lanesApart = Math.abs(end.y - start.y) / geometry.pitch;
	const slack = (end.x - start.x) / geometry.pitch - (lanesApart + 1);
	const leaves = { x: start.x + half, y: start.y };
	const joins = { x: end.x - half, y: end.y };
	if (slack <= 0) return [start, leaves, joins, end];
	const between = start.y + fall * half;
	const fallen = { x: leaves.x + half, y: between };
	const runOn = { x: fallen.x + slack * geometry.pitch, y: between };
	return [start, leaves, fallen, runOn, joins, end];
}

export function joiningCorner(corners: Point[]): Point {
	return corners[corners.length - 2];
}
