import {
	chatWhiteboardLimits,
	whiteboardTools,
	type WhiteboardColour,
	type WhiteboardPoint,
	type WhiteboardStroke,
	type WhiteboardText
} from './chatWhiteboardRules';

/** How far the pen moves on the board before its line takes another point, so a slow hand does not fill a stroke. */
export const leastPenStep = 2;

/** Where the board is drawn on the screen, as the browser measures it, in screen pixels. */
export type BoardFrame = { left: number; top: number; width: number; height: number };

const { boardWidth, boardHeight, mostPointsInAStroke } = chatWhiteboardLimits;

function wholeUnitsWithin(value: number, largest: number): number {
	return Math.min(Math.max(Math.round(value), 0), largest);
}

/** The place on the board under a point of the screen, in the board's whole units, kept to the board's edges. */
export function boardPointAt(screenAcross: number, screenDown: number, frame: BoardFrame): WhiteboardPoint {
	const across = ((screenAcross - frame.left) / frame.width) * boardWidth;
	const down = ((screenDown - frame.top) / frame.height) * boardHeight;
	return [wholeUnitsWithin(across, boardWidth), wholeUnitsWithin(down, boardHeight)];
}

/** A line begun with the pen at the point. */
export function strokeStartedAt(point: WhiteboardPoint, colour: WhiteboardColour, width: number): WhiteboardStroke {
	return { tool: whiteboardTools.pen, colour, width, points: [point] };
}

/** Where the line has got to: its latest point. */
function lastPointOf(stroke: WhiteboardStroke): WhiteboardPoint {
	const { points } = stroke;
	return points[points.length - 1];
}

/** Whether the pen has moved far enough from the line's last point to take another. */
export function isFarEnoughToDraw(stroke: WhiteboardStroke, [across, down]: WhiteboardPoint): boolean {
	const [lastAcross, lastDown] = lastPointOf(stroke);
	return Math.hypot(across - lastAcross, down - lastDown) >= leastPenStep;
}

/** The line taken on to the point. */
export function strokeWithPointAdded(stroke: WhiteboardStroke, point: WhiteboardPoint): WhiteboardStroke {
	const { points } = stroke;
	return { ...stroke, points: [...points, point] };
}

/** Whether the line holds the most points a stroke may, so the hand carries on in a new stroke from its end. */
export function isStrokeFull(stroke: WhiteboardStroke): boolean {
	const { points } = stroke;
	return points.length >= mostPointsInAStroke;
}

/** A new line begun where a full one ended, in the same colour and width, so the drawing carries on unbroken. */
export function strokeContinuedFrom(stroke: WhiteboardStroke): WhiteboardStroke {
	return strokeStartedAt(lastPointOf(stroke), stroke.colour, stroke.width);
}

/** Words placed on the board at the point. */
export function textPlacedAt(point: WhiteboardPoint, text: string, colour: WhiteboardColour, size: number): WhiteboardText {
	return { tool: whiteboardTools.text, colour, size, at: point, text };
}
