import { Mesh, MeshBasicMaterial, PlaneGeometry, type Group, type Texture } from 'three';
import { cardsInColumnAt, tasksGoingLive, tasksGoneLiveBy } from '../boardLayout';
import { liveColumn } from '../boardStory';
import { boardColumns, tasksDoneOnTheBoard } from '../promoBoard';
import { cardMove } from './boardCardPose';
import { createColumnHeader } from './boardColumnHeader';
import { boardShape, columnX, headerMiddle, panelHeight, panelMiddle } from './boardShape';
import { createSurface, surfaceTexture, traceRoundedRectangle } from './canvasSurface';
import type { FadeGroup } from './fadeGroup';
import { cssColour, type PromoPalette } from './promoPalette';

export type BoardColumns = { update: (boardBeats: number) => void };

const panel = { pixelsPerUnit: 50, radius: 30, border: 3, tint: 0.55, depth: -0.12 };
const headerDepth = 0.02;

function drawPanel(palette: PromoPalette): Texture {
	const width = boardShape.columnWidth * panel.pixelsPerUnit;
	const height = panelHeight * panel.pixelsPerUnit;
	const surface = createSurface(width, height);
	const { context } = surface;
	const half = panel.border / 2;
	traceRoundedRectangle(context, { x: half, y: half, width: width - panel.border, height: height - panel.border }, panel.radius);
	context.globalAlpha = panel.tint;
	context.fillStyle = cssColour(palette.carriage);
	context.fill();
	context.globalAlpha = 1;
	context.lineWidth = panel.border;
	context.strokeStyle = cssColour(palette.hairline);
	context.stroke();
	return surfaceTexture(surface);
}

function countShownAt(column: number, boardBeats: number): number {
	const landedBeats = boardBeats - cardMove.beats;
	if (column !== liveColumn) return cardsInColumnAt(column, landedBeats);
	return tasksDoneOnTheBoard - tasksGoingLive + tasksGoneLiveBy(landedBeats);
}

/** The board's five columns: a glass panel each, headed by its name, its step and its count. */
export function createBoardColumns(board: Group, palette: PromoPalette, fades: FadeGroup): BoardColumns {
	const panelTexture = drawPanel(palette);
	const panelShape = new PlaneGeometry(boardShape.columnWidth, panelHeight);
	const headers = boardColumns.map((column, index) => {
		const backing = new Mesh(panelShape, fades.add(new MeshBasicMaterial({ map: panelTexture })));
		backing.position.set(columnX(index), panelMiddle, panel.depth);
		const accent = index === liveColumn ? palette.go : palette.chalk;
		const header = createColumnHeader({ column, accent, palette });
		const { mesh, material } = header;
		fades.add(material);
		mesh.position.set(columnX(index), headerMiddle, headerDepth);
		board.add(backing, mesh);
		return header;
	});
	const update = (boardBeats: number) => {
		headers.forEach((header, index) => header.showCount(countShownAt(index, boardBeats)));
	};
	return { update };
}
