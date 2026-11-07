import { fontOf, promoFonts } from './promoFonts';
import { cssColour, type PromoPalette } from './promoPalette';

export type FragmentDrawing = (context: CanvasRenderingContext2D, palette: PromoPalette) => void;

export const fragmentCard = { width: 256, height: 320, radius: 28, inset: 40, stroke: 6 };

const { width, inset } = fragmentCard;
const innerWidth = width - inset * 2;
const textLineHeight = 22;
const textLineGap = 18;

function strokeWith(context: CanvasRenderingContext2D, colour: string): void {
	context.strokeStyle = colour;
	context.lineWidth = fragmentCard.stroke;
	context.lineJoin = 'round';
	context.lineCap = 'round';
}

function drawTextLines(context: CanvasRenderingContext2D, top: number, count: number, colour: string): void {
	context.fillStyle = colour;
	for (let line = 0; line < count; line += 1) {
		const isLast = line === count - 1;
		const lineWidth = isLast ? innerWidth * 0.6 : innerWidth;
		context.fillRect(inset, top + line * (textLineHeight + textLineGap), lineWidth, textLineHeight / 2);
	}
}

const drawEmail: FragmentDrawing = (context, palette) => {
	strokeWith(context, cssColour(palette.chalk));
	context.strokeRect(inset, inset + 20, innerWidth, 110);
	context.beginPath();
	context.moveTo(inset, inset + 20);
	context.lineTo(width / 2, inset + 85);
	context.lineTo(width - inset, inset + 20);
	context.stroke();
	context.fillStyle = cssColour(palette.signal);
	context.beginPath();
	context.arc(width - inset, inset + 20, 16, 0, Math.PI * 2);
	context.fill();
	drawTextLines(context, 210, 2, cssColour(palette.hairline));
};

const drawSpreadsheet: FragmentDrawing = (context, palette) => {
	const cellWidth = innerWidth / 3;
	const cellHeight = 40;
	context.fillStyle = cssColour(palette.go);
	context.fillRect(inset, inset, innerWidth, cellHeight);
	strokeWith(context, cssColour(palette.chalk));
	for (let row = 0; row < 5; row += 1) {
		for (let column = 0; column < 3; column += 1) {
			context.strokeRect(inset + column * cellWidth, inset + row * cellHeight, cellWidth, cellHeight);
		}
	}
};

const drawInvoice: FragmentDrawing = (context, palette) => {
	context.fillStyle = cssColour(palette.caution);
	context.font = fontOf(700, 120, promoFonts.display);
	context.textAlign = 'center';
	context.fillText('£', width / 2, inset + 115);
	drawTextLines(context, 190, 3, cssColour(palette.chalk));
};

const drawChat: FragmentDrawing = (context, palette) => {
	const [victoria] = palette.lines;
	strokeWith(context, cssColour(victoria));
	context.beginPath();
	context.roundRect(inset, inset + 10, innerWidth, 120, 30);
	context.moveTo(inset + 40, inset + 130);
	context.lineTo(inset + 25, inset + 170);
	context.lineTo(inset + 80, inset + 130);
	context.stroke();
	context.fillStyle = cssColour(palette.chalk);
	[0, 1, 2].forEach((dot) => context.fillRect(inset + 45 + dot * 45, inset + 62, 18, 18));
	drawTextLines(context, 240, 1, cssColour(palette.hairline));
};

const drawDocument: FragmentDrawing = (context, palette) => {
	const metropolitan = palette.lines[3];
	context.fillStyle = cssColour(metropolitan);
	context.fillRect(inset, inset, 86, 44);
	context.fillStyle = cssColour(palette.night);
	context.font = fontOf(700, 28, promoFonts.body);
	context.fillText('PDF', inset + 14, inset + 32);
	drawTextLines(context, inset + 90, 5, cssColour(palette.chalk));
};

/** One drawing for each kind of thing a business is buried in: email, sheets, invoices, chat and documents. */
export const fragmentDrawings: FragmentDrawing[] = [drawEmail, drawSpreadsheet, drawInvoice, drawChat, drawDocument];
