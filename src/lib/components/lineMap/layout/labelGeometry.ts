import type { Box, Point } from './lineMapGeometry';
import { LabelSpacing } from './lineMapGeometry';
import type { HandoverBranch } from './lineMapLayout';

function pointsAlong(start: Point, end: Point): Point[] {
	const length = Math.hypot(end.x - start.x, end.y - start.y);
	const count = Math.max(1, Math.round(length / LabelSpacing.pointStep));
	return Array.from({ length: count + 1 }, (_, index) => ({
		x: start.x + ((end.x - start.x) * index) / count,
		y: start.y + ((end.y - start.y) * index) / count
	}));
}

export function isInside(point: Point, box: Box, margin: number): boolean {
	const isAcross = point.x > box.x - margin && point.x < box.x + box.width + margin;
	return isAcross && point.y > box.y - margin && point.y < box.y + box.height + margin;
}

export function boxesOverlap(first: Box, second: Box, margin: number): boolean {
	const isAcross = first.x < second.x + second.width + margin && second.x < first.x + first.width + margin;
	return isAcross && first.y < second.y + second.height + margin && second.y < first.y + first.height + margin;
}

export function forkPointsOffLanes(branches: HandoverBranch[]): Point[] {
	return branches.flatMap((branch) => {
		const { corners } = branch;
		return corners.slice(1, -2).flatMap((corner, index) => pointsAlong(corner, corners[index + 2]));
	});
}

export function isCrossedByForks(box: Box, forkPoints: Point[]): boolean {
	return forkPoints.some((point) => isInside(point, box, LabelSpacing.forkClearance));
}
