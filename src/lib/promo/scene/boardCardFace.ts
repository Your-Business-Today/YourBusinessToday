import type { Color, Texture } from 'three';
import type { BoardTask, BoardTaskKind } from '../promoBoard';
import { createSurface, surfaceTexture, traceRoundedRectangle, wrapLines } from './canvasSurface';
import { fontOf, promoFonts } from './promoFonts';
import { cssColour, type PromoPalette } from './promoPalette';

type Pen = { context: CanvasRenderingContext2D; palette: PromoPalette };

const face = { width: 640, height: 288, radius: 30, inset: 30, border: 3 };
const chip = { top: 26, height: 46, padding: 18, radius: 23, fontSize: 24, weight: 600, tint: 0.16 };
const points = { fontSize: 24, weight: 500, fade: 0.62 };
const title = { top: 100, fontSize: 31, lineHeight: 41, weight: 600, maxLines: 3 };

function kindColour(kind: BoardTaskKind, palette: PromoPalette): Color {
	const [victoria] = palette.lines;
	const colours: Record<BoardTaskKind, Color> = { Feature: victoria, Fix: palette.signal, Refactor: palette.caution };
	return colours[kind];
}

function drawBody({ context, palette }: Pen): void {
	const half = face.border / 2;
	const box = { x: half, y: half, width: face.width - face.border, height: face.height - face.border };
	traceRoundedRectangle(context, box, face.radius);
	context.fillStyle = cssColour(palette.carriage);
	context.fill();
	context.lineWidth = face.border;
	context.strokeStyle = cssColour(palette.hairline);
	context.stroke();
}

function drawKindChip({ context }: Pen, kind: BoardTaskKind, colour: Color): void {
	context.font = fontOf(chip.weight, chip.fontSize, promoFonts.body);
	const measured = context.measureText(kind);
	const width = measured.width + chip.padding * 2;
	traceRoundedRectangle(context, { x: face.inset, y: chip.top, width, height: chip.height }, chip.radius);
	context.globalAlpha = chip.tint;
	context.fillStyle = cssColour(colour);
	context.fill();
	context.globalAlpha = 1;
	context.textBaseline = 'middle';
	context.fillText(kind, face.inset + chip.padding, chip.top + chip.height / 2);
}

function drawPoints({ context, palette }: Pen, taskPoints: number): void {
	context.font = fontOf(points.weight, points.fontSize, promoFonts.body);
	context.globalAlpha = points.fade;
	context.fillStyle = cssColour(palette.chalk);
	context.textAlign = 'right';
	context.fillText(`${taskPoints} points`, face.width - face.inset, chip.top + chip.height / 2);
	context.textAlign = 'left';
	context.globalAlpha = 1;
}

function drawTitle({ context, palette }: Pen, text: string): void {
	context.font = fontOf(title.weight, title.fontSize, promoFonts.body);
	context.fillStyle = cssColour(palette.chalk);
	context.textBaseline = 'top';
	const lines = wrapLines(context, text, face.width - face.inset * 2);
	lines.slice(0, title.maxLines).forEach((line, index) => {
		context.fillText(line, face.inset, title.top + index * title.lineHeight);
	});
}

/** A task as the board shows it: what kind of work it is, its size in points and its title. */
export function drawCardFace(task: BoardTask, palette: PromoPalette): Texture {
	const surface = createSurface(face.width, face.height);
	const pen = { context: surface.context, palette };
	drawBody(pen);
	drawKindChip(pen, task.kind, kindColour(task.kind, palette));
	drawPoints(pen, task.points);
	drawTitle(pen, task.title);
	return surfaceTexture(surface);
}
