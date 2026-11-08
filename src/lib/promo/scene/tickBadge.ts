import type { Texture } from 'three';
import { createSurface, surfaceTexture } from './canvasSurface';
import { cssColour, type PromoPalette } from './promoPalette';

const badge = { pixels: 128, stroke: 13 };
const tickPoints = [
	[0.3, 0.52],
	[0.44, 0.66],
	[0.71, 0.37]
];

/** The green tick a task wears once it is live. */
export function drawTickBadge(palette: PromoPalette): Texture {
	const surface = createSurface(badge.pixels, badge.pixels);
	const { context } = surface;
	const centre = badge.pixels / 2;
	context.fillStyle = cssColour(palette.go);
	context.beginPath();
	context.arc(centre, centre, centre, 0, Math.PI * 2);
	context.fill();
	context.strokeStyle = cssColour(palette.night);
	context.lineWidth = badge.stroke;
	context.lineCap = 'round';
	context.lineJoin = 'round';
	context.beginPath();
	tickPoints.forEach(([across, down]) => context.lineTo(across * badge.pixels, down * badge.pixels));
	context.stroke();
	return surfaceTexture(surface);
}
