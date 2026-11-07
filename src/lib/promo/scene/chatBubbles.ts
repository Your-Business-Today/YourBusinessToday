import type { Color } from 'three';
import { traceRoundedRectangle, wrapLines } from './canvasSurface';
import { fontOf, promoFonts } from './promoFonts';
import { cssColour } from './promoPalette';

export type Bubble = { text: string; top: number; isMine: boolean; fill: Color; ink: Color };

export const bubbleShape = { maxWidth: 440, padding: 26, fontSize: 30, weight: 500, lineHeight: 40, radius: 30, edge: 36, gap: 22 };

const thinking = { width: 120, height: 72, dotRadius: 7, dotGap: 24, fade: 0.6 };
const dotPlaces = [-1, 0, 1];

/** Draws a message bubble, mine on the right and the assistant's on the left, and says where the next one starts. */
export function drawBubble(context: CanvasRenderingContext2D, bubble: Bubble, screenWidth: number): number {
	context.font = fontOf(bubbleShape.weight, bubbleShape.fontSize, promoFonts.body);
	const lines = wrapLines(context, bubble.text, bubbleShape.maxWidth - bubbleShape.padding * 2);
	const widths = lines.map((line) => context.measureText(line)).map((measured) => measured.width);
	const width = Math.max(...widths) + bubbleShape.padding * 2;
	const textHeight = (lines.length - 1) * bubbleShape.lineHeight + bubbleShape.fontSize;
	const height = textHeight + bubbleShape.padding * 2;
	const left = bubble.isMine ? screenWidth - bubbleShape.edge - width : bubbleShape.edge;
	traceRoundedRectangle(context, { x: left, y: bubble.top, width, height }, bubbleShape.radius);
	context.fillStyle = cssColour(bubble.fill);
	context.fill();
	context.fillStyle = cssColour(bubble.ink);
	context.textBaseline = 'top';
	lines.forEach((line, index) => {
		context.fillText(line, left + bubbleShape.padding, bubble.top + bubbleShape.padding + index * bubbleShape.lineHeight);
	});
	return bubble.top + height + bubbleShape.gap;
}

/** The three dots the assistant shows while it works out its answer. */
export function drawThinking(context: CanvasRenderingContext2D, top: number, fill: Color, ink: Color): void {
	traceRoundedRectangle(context, { x: bubbleShape.edge, y: top, width: thinking.width, height: thinking.height }, bubbleShape.radius);
	context.fillStyle = cssColour(fill);
	context.fill();
	context.globalAlpha = thinking.fade;
	context.fillStyle = cssColour(ink);
	const middle = bubbleShape.edge + thinking.width / 2;
	dotPlaces.forEach((place) => {
		context.beginPath();
		context.arc(middle + place * thinking.dotGap, top + thinking.height / 2, thinking.dotRadius, 0, Math.PI * 2);
		context.fill();
	});
	context.globalAlpha = 1;
}
