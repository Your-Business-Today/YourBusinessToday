const sideBySideMargin = 8;
const loopReach = 36;

type Point = { x: number; y: number };

/** Any box placed on a map: where it starts and how big it is. */
export type MapBox = Point & { width: number; height: number };

/** A curve from one box on a map to another, in that direction, leaving and arriving on the sides that face each other. */
export function relationshipPath(from: MapBox, to: MapBox): string {
	const isToTheRight = to.x > from.x + from.width + sideBySideMargin;
	const isToTheLeft = to.x + to.width + sideBySideMargin < from.x;
	if (isToTheRight) return rightwardCurve(from, to);
	if (isToTheLeft) return leftwardCurve(from, to);
	return loopOnTheRight(rightMiddle(from), rightMiddle(to));
}

function rightwardCurve(from: MapBox, to: MapBox): string {
	return curve(rightMiddle(from), leftMiddle(to));
}

function leftwardCurve(from: MapBox, to: MapBox): string {
	return curve(leftMiddle(from), rightMiddle(to));
}

function rightMiddle(placed: MapBox): Point {
	return { x: placed.x + placed.width, y: placed.y + placed.height / 2 };
}

function leftMiddle(placed: MapBox): Point {
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
