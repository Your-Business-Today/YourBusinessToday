import { Sprite, SpriteMaterial } from 'three';
import { createSurface, surfaceTexture, traceRoundedRectangle } from './canvasSurface';
import { fontOf, promoFonts } from './promoFonts';
import { cssColour, type PromoPalette } from './promoPalette';

export type LabelLook = { worldHeight: number; weight: number };

const labelPixels = { fontSize: 64, height: 112, padding: 36, radius: 56 };
const backingOpacity = 0.72;

function measureLabel(text: string, font: string): number {
	const { context } = createSurface(1, 1);
	context.font = font;
	const measured = context.measureText(text);
	return Math.ceil(measured.width) + labelPixels.padding * 2;
}

/** A name that hangs in the scene facing the camera, on a dark pill so it reads over anything behind it. */
export function createLabelSprite(text: string, palette: PromoPalette, look: LabelLook): Sprite {
	const font = fontOf(look.weight, labelPixels.fontSize, promoFonts.body);
	const width = measureLabel(text, font);
	const surface = createSurface(width, labelPixels.height);
	const { context } = surface;
	traceRoundedRectangle(context, { x: 0, y: 0, width, height: labelPixels.height }, labelPixels.radius);
	context.globalAlpha = backingOpacity;
	context.fillStyle = cssColour(palette.night);
	context.fill();
	context.globalAlpha = 1;
	context.font = font;
	context.fillStyle = cssColour(palette.chalk);
	context.textAlign = 'center';
	context.textBaseline = 'middle';
	context.fillText(text, width / 2, labelPixels.height / 2);
	const material = new SpriteMaterial({ map: surfaceTexture(surface), transparent: true, depthWrite: false });
	const sprite = new Sprite(material);
	sprite.scale.set((look.worldHeight * width) / labelPixels.height, look.worldHeight, 1);
	return sprite;
}
