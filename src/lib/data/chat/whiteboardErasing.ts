import { whiteboardTools, type WhiteboardItem, type WhiteboardPoint, type WhiteboardStroke, type WhiteboardText } from './chatWhiteboardRules';

/** How far around the eraser's tip it takes an item off, in the board's units. */
export const eraserReach = 16;

/** How wide a letter is for its size, on average, so the eraser knows where a text item's words lie. */
export const averageLetterWidthForSize = 0.55;

function distanceBetween([fromAcross, fromDown]: WhiteboardPoint, [toAcross, toDown]: WhiteboardPoint): number {
	return Math.hypot(toAcross - fromAcross, toDown - fromDown);
}

/** How near the point comes to the straight line from start to end. */
function distanceToSegment(point: WhiteboardPoint, start: WhiteboardPoint, end: WhiteboardPoint): number {
	const [across, down] = point;
	const [startAcross, startDown] = start;
	const runAcross = end[0] - startAcross;
	const runDown = end[1] - startDown;
	const lengthSquared = runAcross * runAcross + runDown * runDown;
	if (lengthSquared === 0) return distanceBetween(point, start);
	const along = ((across - startAcross) * runAcross + (down - startDown) * runDown) / lengthSquared;
	const clampedAlong = Math.min(Math.max(along, 0), 1);
	return distanceBetween(point, [startAcross + clampedAlong * runAcross, startDown + clampedAlong * runDown]);
}

function isStrokeTouchedAt(stroke: WhiteboardStroke, point: WhiteboardPoint, reach: number): boolean {
	const { points } = stroke;
	const within = reach + stroke.width / 2;
	if (points.length === 1) return distanceBetween(point, points[0]) <= within;
	return points.slice(1).some((end, place) => distanceToSegment(point, points[place], end) <= within);
}

function isTextTouchedAt(item: WhiteboardText, [across, down]: WhiteboardPoint, reach: number): boolean {
	const [left, baseline] = item.at;
	const { text, size } = item;
	const right = left + text.length * size * averageLetterWidthForSize;
	const top = baseline - size;
	const isAcrossIt = across >= left - reach && across <= right + reach;
	return isAcrossIt && down >= top - reach && down <= baseline + reach;
}

/** Whether the eraser at the point touches the item: comes within reach of its line, or of where its words lie. */
export function isItemTouchedAt(item: WhiteboardItem, point: WhiteboardPoint, reach: number = eraserReach): boolean {
	if (item.tool === whiteboardTools.pen) return isStrokeTouchedAt(item, point, reach);
	return isTextTouchedAt(item, point, reach);
}

/** The items with every one the eraser touches at the point taken off whole; the same list when it touches none. */
export function withItemsErasedAt(items: WhiteboardItem[], point: WhiteboardPoint): WhiteboardItem[] {
	const kept = items.filter((item) => !isItemTouchedAt(item, point));
	if (kept.length === items.length) return items;
	return kept;
}
