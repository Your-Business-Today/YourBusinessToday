import type { ChatState } from '../assistantChat';
import { assistantChat } from '../assistantChat';
import { drawBubble, drawThinking } from './chatBubbles';
import { traceRoundedRectangle, type CanvasSurface } from './canvasSurface';
import { fontOf, promoFonts } from './promoFonts';
import { cssColour, type PromoPalette } from './promoPalette';

const clock = { text: '09:41', top: 34, left: 48, size: 26, weight: 600 };
const heading = { avatarX: 76, avatarY: 150, avatarRadius: 36, left: 132, titleTop: 120, subtitleTop: 162 };
const headingType = { titleSize: 32, subtitleSize: 22, weight: 600, letterSize: 34 };
const divider = { top: 222, height: 2 };
const firstMessageTop = 262;
const screenCornerRadius = 56;
const composer = { inset: 32, height: 86, fromBottom: 128, placeholderFade: 0.4, size: 26, weight: 500 };

function drawHeading(context: CanvasRenderingContext2D, palette: PromoPalette): void {
	context.fillStyle = cssColour(palette.go);
	context.beginPath();
	context.arc(heading.avatarX, heading.avatarY, heading.avatarRadius, 0, Math.PI * 2);
	context.fill();
	context.fillStyle = cssColour(palette.night);
	context.textAlign = 'center';
	context.textBaseline = 'middle';
	context.font = fontOf(headingType.weight, headingType.letterSize, promoFonts.display);
	context.fillText(assistantChat.portalName.charAt(0), heading.avatarX, heading.avatarY);
	context.textAlign = 'left';
	context.textBaseline = 'top';
	context.fillStyle = cssColour(palette.chalk);
	context.font = fontOf(headingType.weight, headingType.titleSize, promoFonts.body);
	context.fillText(assistantChat.portalName, heading.left, heading.titleTop);
	context.fillStyle = cssColour(palette.go);
	context.font = fontOf(headingType.weight, headingType.subtitleSize, promoFonts.body);
	context.fillText('Assistant · online', heading.left, heading.subtitleTop);
}

function drawComposer(context: CanvasRenderingContext2D, palette: PromoPalette, width: number, height: number): void {
	const top = height - composer.fromBottom;
	const box = { x: composer.inset, y: top, width: width - composer.inset * 2, height: composer.height };
	traceRoundedRectangle(context, box, composer.height / 2);
	context.strokeStyle = cssColour(palette.hairline);
	context.lineWidth = divider.height;
	context.stroke();
	context.globalAlpha = composer.placeholderFade;
	context.fillStyle = cssColour(palette.chalk);
	context.font = fontOf(composer.weight, composer.size, promoFonts.body);
	context.textBaseline = 'middle';
	context.fillText(`Message ${assistantChat.portalName}`, composer.inset * 2, top + composer.height / 2);
	context.globalAlpha = 1;
}

function drawMessages(context: CanvasRenderingContext2D, palette: PromoPalette, state: ChatState, width: number): void {
	if (!state.question) return;
	const [victoria] = palette.lines;
	const question = { text: state.question, top: firstMessageTop, isMine: true, fill: victoria, ink: palette.chalk };
	const answerTop = drawBubble(context, question, width);
	if (state.isThinking) drawThinking(context, answerTop, palette.carriage, palette.chalk);
	if (!state.answer) return;
	drawBubble(context, { ...question, text: state.answer, top: answerTop, isMine: false, fill: palette.carriage }, width);
}

/** Paints the phone's screen: the portal's assistant, with the conversation as far as it has got. */
export function drawChatScreen({ canvas, context }: CanvasSurface, palette: PromoPalette, state: ChatState): void {
	const { width, height } = canvas;
	context.clearRect(0, 0, width, height);
	traceRoundedRectangle(context, { x: 0, y: 0, width, height }, screenCornerRadius);
	context.fillStyle = cssColour(palette.night);
	context.fill();
	context.fillStyle = cssColour(palette.chalk);
	context.font = fontOf(clock.weight, clock.size, promoFonts.body);
	context.textBaseline = 'top';
	context.fillText(clock.text, clock.left, clock.top);
	drawHeading(context, palette);
	context.fillStyle = cssColour(palette.hairline);
	context.fillRect(0, divider.top, width, divider.height);
	drawMessages(context, palette, state, width);
	drawComposer(context, palette, width, height);
}
