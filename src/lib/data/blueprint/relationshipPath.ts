import type { PlacedEntity } from './domainLayout';

const sideBySideMargin = 8;
const loopReach = 36;

type Point = { x: number; y: number };

/** A curve from one entity's box to another's, leaving and arriving on the sides that face each other. */
export function relationshipPath(from: PlacedEntity, to: PlacedEntity): string {
	const isToTheRight = to.x > from.x + from.width + sideBySideMargin;
	const isToTheLeft = to.x + to.width + sideBySideMargin < from.x;
	if (isToTheRight) return rightwardCurve(from, to);
	if (isToTheLeft) return rightwardCurve(to, from);
	return loopOnTheRight(rightMiddle(from), rightMiddle(to));
}

function rightwardCurve(left: PlacedEntity, right: PlacedEntity): string {
	return curve(rightMiddle(left), leftMiddle(right));
}

function rightMiddle(placed: PlacedEntity): Point {
	return { x: placed.x + placed.width, y: placed.y + placed.height / 2 };
}

function leftMiddle(placed: PlacedEntity): Point {
	return { x: placed.x, y: placed.y + placed.height / 2 };
}

function curve(start: Point, end: Point): string {
	const bend = (end.x - start.x) / 2;
	return `M ${start.x} ${start.y} C ${start.x + bend} ${start.y}, ${end.x - bend} ${end.y}, ${end.x} ${end.y}`;
}

/** Two entities in one column are joined by a loop out to the right, so the line never crosses the boxes. */
function loopOnTheRight(start: Point, end: Point): string {
	const reach = Math.max(start.x, end.x) + loopReach;
	return `M ${start.x} ${start.y} C ${reach} ${start.y}, ${reach} ${end.y}, ${end.x} ${end.y}`;
}
