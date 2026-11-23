import { whiteboardPenWidths, whiteboardTextSizes, whiteboardTools, type WhiteboardTool } from '$lib/data/chat/chatWhiteboardRules';

/** Each tool as its button names it; the eraser says it takes off whole lines, since it never cuts one in two. */
export const whiteboardToolLabels: { tool: WhiteboardTool; label: string }[] = [
	{ tool: whiteboardTools.pen, label: 'Pen' },
	{ tool: whiteboardTools.eraser, label: 'Eraser (whole lines)' },
	{ tool: whiteboardTools.text, label: 'Text' }
];

const widthWords = ['Fine', 'Medium', 'Bold', 'Marker'];
const sizeWords = ['Small text', 'Medium text', 'Large text'];

/** Each pen width with the word its button shows. */
export const whiteboardWidthChoices = whiteboardPenWidths.map((width, place) => ({ value: width as number, label: widthWords[place] }));

/** Each text size with the word its button shows. */
export const whiteboardSizeChoices = whiteboardTextSizes.map((size, place) => ({ value: size as number, label: sizeWords[place] }));
