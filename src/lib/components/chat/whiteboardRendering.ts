import { whiteboardColours, whiteboardTools, type WhiteboardColour, type WhiteboardItem, type WhiteboardPoint, type WhiteboardStroke, type WhiteboardText } from '$lib/data/chat/chatWhiteboardRules';
import { whiteboardColourTokens, whiteboardFontToken, whiteboardPaperToken } from './whiteboardColours';

/** The colours and type the board is drawn in, read from the site's theme where the board is. */
export type BoardPalette = { paper: string; colours: Record<WhiteboardColour, string>; font: string };

const placeMarkReach = 10;
const placeMarkWidth = 2;

/** The palette as the theme gives it at the element. */
export function paletteAt(element: Element): BoardPalette {
	const style = getComputedStyle(element);
	const tokenValue = (token: string) => style.getPropertyValue(token).trim();
	const colours = Object.fromEntries(whiteboardColours.map((colour) => [colour, tokenValue(whiteboardColourTokens[colour])]));
	return { paper: tokenValue(whiteboardPaperToken), colours: colours as Record<WhiteboardColour, string>, font: tokenValue(whiteboardFontToken) };
}

function drawStroke(context: CanvasRenderingContext2D, stroke: WhiteboardStroke, palette: BoardPalette): void {
	const [first, ...rest] = stroke.points;
	context.strokeStyle = palette.colours[stroke.colour];
	context.fillStyle = palette.colours[stroke.colour];
	context.lineWidth = stroke.width;
	context.beginPath();
	if (rest.length === 0) {
		context.arc(first[0], first[1], stroke.width / 2, 0, Math.PI * 2);
		context.fill();
		return;
	}
	context.moveTo(first[0], first[1]);
	for (const [across, down] of rest) context.lineTo(across, down);
	context.stroke();
}

function drawText(context: CanvasRenderingContext2D, item: WhiteboardText, palette: BoardPalette): void {
	context.fillStyle = palette.colours[item.colour];
	context.font = `${item.size}px ${palette.font}`;
	context.fillText(item.text, item.at[0], item.at[1]);
}

/** Marks where text will be placed, a small cross the posted picture never carries once the text is placed. */
function drawPlaceMark(context: CanvasRenderingContext2D, [across, down]: WhiteboardPoint, palette: BoardPalette): void {
	const { colours } = palette;
	context.strokeStyle = colours.blue;
	context.lineWidth = placeMarkWidth;
	context.beginPath();
	context.moveTo(across - placeMarkReach, down);
	context.lineTo(across + placeMarkReach, down);
	context.moveTo(across, down - placeMarkReach);
	context.lineTo(across, down + placeMarkReach);
	context.stroke();
}

/** Draws the whole board afresh: the paper, then every item oldest first, then where text is about to go. */
export function drawBoard(context: CanvasRenderingContext2D, items: WhiteboardItem[], palette: BoardPalette, textAt: WhiteboardPoint | null): void {
	const { width, height } = context.canvas;
	context.lineCap = 'round';
	context.lineJoin = 'round';
	context.fillStyle = palette.paper;
	context.fillRect(0, 0, width, height);
	for (const item of items) {
		if (item.tool === whiteboardTools.pen) drawStroke(context, item, palette);
		if (item.tool === whiteboardTools.text) drawText(context, item, palette);
	}
	if (textAt !== null) drawPlaceMark(context, textAt, palette);
}
