import { CanvasTexture, SRGBColorSpace } from 'three';

export type CanvasSurface = { canvas: HTMLCanvasElement; context: CanvasRenderingContext2D };

const textureSharpness = 8;

export function createSurface(width: number, height: number): CanvasSurface {
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const context = canvas.getContext('2d');
	if (context === null) throw new Error('This browser cannot draw on a canvas.');
	return { canvas, context };
}

/** A texture that shows what was drawn on the surface, in the brand's own colours. */
export function surfaceTexture(surface: CanvasSurface): CanvasTexture {
	const texture = new CanvasTexture(surface.canvas);
	texture.colorSpace = SRGBColorSpace;
	texture.anisotropy = textureSharpness;
	return texture;
}

export function traceRoundedRectangle(
	context: CanvasRenderingContext2D,
	box: { x: number; y: number; width: number; height: number },
	radius: number
): void {
	context.beginPath();
	context.roundRect(box.x, box.y, box.width, box.height, radius);
}

/** Breaks text into the lines that fit a width in the context's current font. */
export function wrapLines(context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
	const lines: string[] = [];
	let line = '';
	for (const word of text.split(' ')) {
		const candidate = line ? `${line} ${word}` : word;
		const measured = context.measureText(candidate);
		const isTooWide = measured.width > maxWidth;
		if (isTooWide && line) {
			lines.push(line);
			line = word;
			continue;
		}
		line = candidate;
	}
	lines.push(line);
	return lines;
}
