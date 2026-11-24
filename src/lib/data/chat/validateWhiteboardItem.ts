import {
	chatWhiteboardLimits,
	whiteboardColours,
	whiteboardMarkingTools,
	whiteboardPenWidths,
	whiteboardTextSizes,
	whiteboardTools,
	type WhiteboardItem
} from './chatWhiteboardRules';

const { boardWidth, boardHeight, mostPointsInAStroke, longestText } = chatWhiteboardLimits;
const fewestPointsInAStroke = 1;
const numbersInAPoint = 2;
const controlCharacter = /\p{Cc}/u;

const listed = (values: readonly (string | number)[]) => values.join(', ');

/** Whether the value is a place on the board: two whole numbers, across within its width and down within its height. */
function isPointOnTheBoard(value: unknown): boolean {
	if (!Array.isArray(value) || value.length !== numbersInAPoint) return false;
	const [across, down] = value;
	const isWhole = Number.isInteger(across) && Number.isInteger(down);
	return isWhole && across >= 0 && across <= boardWidth && down >= 0 && down <= boardHeight;
}

function pointsRefusal(field: string, points: unknown): string | null {
	if (!Array.isArray(points)) return `${field}.points is a list of points on the board.`;
	const count = points.length;
	const isFittingCount = count >= fewestPointsInAStroke && count <= mostPointsInAStroke;
	if (!isFittingCount) return `${field}.points has ${count} points; a stroke has 1 to ${mostPointsInAStroke}.`;
	const offBoard = points.findIndex((point) => !isPointOnTheBoard(point));
	if (offBoard === -1) return null;
	return `${field}.points[${offBoard}] is two whole numbers on the board, from 0 to ${boardWidth} across and 0 to ${boardHeight} down.`;
}

function strokeRefusal(field: string, item: Record<string, unknown>): string | null {
	const isListedWidth = (whiteboardPenWidths as readonly unknown[]).includes(item.width);
	if (!isListedWidth) return `${field}.width is one of ${listed(whiteboardPenWidths)}.`;
	return pointsRefusal(field, item.points);
}

function textRefusal(field: string, item: Record<string, unknown>): string | null {
	const isListedSize = (whiteboardTextSizes as readonly unknown[]).includes(item.size);
	if (!isListedSize) return `${field}.size is one of ${listed(whiteboardTextSizes)}.`;
	if (!isPointOnTheBoard(item.at)) return `${field}.at is two whole numbers on the board, from 0 to ${boardWidth} across and 0 to ${boardHeight} down.`;
	const text = item.text;
	const isFittingText = typeof text === 'string' && text.trim().length > 0 && text.length <= longestText && !controlCharacter.test(text);
	if (!isFittingText) return `${field}.text is one line of 1 to ${longestText} characters.`;
	return null;
}

/** Why the value is not a pen stroke or a text item as the rules have them, naming where it is and the limit; or null. */
export function whiteboardItemRefusal(field: string, value: unknown): string | null {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) return `${field} is a pen stroke or a text item.`;
	const item = value as Record<string, unknown>;
	const isMarkingTool = typeof item.tool === 'string' && whiteboardMarkingTools.includes(item.tool);
	if (!isMarkingTool) return `${field}.tool is one of ${listed(whiteboardMarkingTools)}; the eraser leaves nothing on the board.`;
	const isListedColour = (whiteboardColours as readonly unknown[]).includes(item.colour);
	if (!isListedColour) return `${field}.colour is one of ${listed(whiteboardColours)}.`;
	if (item.tool === whiteboardTools.pen) return strokeRefusal(field, item);
	return textRefusal(field, item);
}

/** The item with only the fields the rules name, so nothing else given is ever stored. */
export function keptItemOf(value: Record<string, unknown>): WhiteboardItem {
	if (value.tool === whiteboardTools.pen) {
		const { tool, colour, width, points } = value;
		return { tool, colour, width, points } as WhiteboardItem;
	}
	const { tool, colour, size, at, text } = value;
	return { tool, colour, size, at, text } as WhiteboardItem;
}
