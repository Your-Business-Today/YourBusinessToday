import type { CanvasTexture } from 'three';
import { createSurface, surfaceTexture } from './canvasSurface';

const textureSize = 256;
const gradientStops = [
	{ at: 0, alpha: 1 },
	{ at: 0.18, alpha: 0.55 },
	{ at: 0.45, alpha: 0.14 },
	{ at: 1, alpha: 0 }
];

/** A soft white disc that fades to nothing at its edge, tinted by whatever material wears it. */
export function createGlowTexture(): CanvasTexture {
	const surface = createSurface(textureSize, textureSize);
	const { context } = surface;
	const centre = textureSize / 2;
	const gradient = context.createRadialGradient(centre, centre, 0, centre, centre, centre);
	gradientStops.forEach((stop) => gradient.addColorStop(stop.at, `rgba(255,255,255,${stop.alpha})`));
	context.fillStyle = gradient;
	context.fillRect(0, 0, textureSize, textureSize);
	return surfaceTexture(surface);
}
