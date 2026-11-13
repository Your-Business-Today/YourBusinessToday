import { CanvasTexture } from 'three';

const TEXTURE_SIZE = 128;
const CORE_STOP = 0;
const HALO_STOP = 0.25;
const EDGE_STOP = 1;

export function createGlowTexture(): CanvasTexture {
	const canvas = document.createElement('canvas');
	canvas.width = TEXTURE_SIZE;
	canvas.height = TEXTURE_SIZE;
	const context = canvas.getContext('2d');
	if (context === null) return new CanvasTexture(canvas);

	const half = TEXTURE_SIZE / 2;
	const gradient = context.createRadialGradient(half, half, 0, half, half, half);
	gradient.addColorStop(CORE_STOP, 'rgba(255, 255, 255, 1)');
	gradient.addColorStop(HALO_STOP, 'rgba(255, 255, 255, 0.35)');
	gradient.addColorStop(EDGE_STOP, 'rgba(255, 255, 255, 0)');
	context.fillStyle = gradient;
	context.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
	return new CanvasTexture(canvas);
}
