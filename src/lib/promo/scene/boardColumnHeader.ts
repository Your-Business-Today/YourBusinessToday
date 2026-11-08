import { Mesh, MeshBasicMaterial, PlaneGeometry, type Color } from 'three';
import type { BoardColumn } from '../promoBoard';
import { createSurface, surfaceTexture, traceRoundedRectangle, type CanvasSurface } from './canvasSurface';
import { fontOf, promoFonts } from './promoFonts';
import { cssColour, type PromoPalette } from './promoPalette';

export type ColumnHeader = { mesh: Mesh; material: MeshBasicMaterial; showCount: (count: number) => void };

type HeaderLook = { column: BoardColumn; accent: Color; palette: PromoPalette };

const pixelsPerUnit = 100;
const header = { width: 840, height: 240, inset: 44 };
const name = { size: 60, weight: 600, top: 46 };
const step = { size: 38, weight: 500, top: 134, fade: 0.55 };
const pill = { height: 84, radius: 42, padding: 30, size: 48, weight: 600, tint: 0.16, top: 78 };

function drawCountPill(context: CanvasRenderingContext2D, count: number, accent: Color): void {
	const text = count.toLocaleString('en-GB');
	context.font = fontOf(pill.weight, pill.size, promoFonts.display);
	const measured = context.measureText(text);
	const width = measured.width + pill.padding * 2;
	const left = header.width - header.inset - width;
	traceRoundedRectangle(context, { x: left, y: pill.top, width, height: pill.height }, pill.radius);
	context.globalAlpha = pill.tint;
	context.fillStyle = cssColour(accent);
	context.fill();
	context.globalAlpha = 1;
	context.textBaseline = 'middle';
	context.fillText(text, left + pill.padding, pill.top + pill.height / 2);
}

function drawHeader({ context }: CanvasSurface, look: HeaderLook, count: number): void {
	const { column, palette } = look;
	context.clearRect(0, 0, header.width, header.height);
	context.textBaseline = 'top';
	context.fillStyle = cssColour(palette.chalk);
	context.font = fontOf(name.weight, name.size, promoFonts.body);
	context.fillText(column.name, header.inset, name.top);
	context.globalAlpha = step.fade;
	context.font = fontOf(step.weight, step.size, promoFonts.body);
	context.fillText(column.step, header.inset, step.top);
	context.globalAlpha = 1;
	drawCountPill(context, count, look.accent);
}

/** A column's name, who moves a task through it, and how many tasks are in it, redrawn only when the count changes. */
export function createColumnHeader(look: HeaderLook): ColumnHeader {
	const surface = createSurface(header.width, header.height);
	const texture = surfaceTexture(surface);
	const material = new MeshBasicMaterial({ map: texture });
	const mesh = new Mesh(new PlaneGeometry(header.width / pixelsPerUnit, header.height / pixelsPerUnit), material);
	let shownCount = Number.NaN;
	const showCount = (count: number) => {
		if (count === shownCount) return;
		shownCount = count;
		drawHeader(surface, look, count);
		texture.needsUpdate = true;
	};
	return { mesh, material, showCount };
}
