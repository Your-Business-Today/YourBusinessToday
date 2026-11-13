import { CanvasTexture, Sprite, SpriteMaterial } from 'three';

const FONT_SIZE_PIXELS = 34;
const FONT = `500 ${FONT_SIZE_PIXELS}px 'Space Grotesk', 'Inter', sans-serif`;
const LETTER_SPACING = '5px';
const PADDING_PIXELS = 16;
const SCREEN_LABEL_HEIGHT = 0.032;
const LABEL_OPACITY = 0.85;

export function createTextSprite(
	text: string,
	colourCss: string,
	screenHeightShare = SCREEN_LABEL_HEIGHT
): Sprite {
	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d');
	if (context === null) return new Sprite();

	styleText(context);
	canvas.width = Math.ceil(context.measureText(text).width) + PADDING_PIXELS * 2;
	canvas.height = FONT_SIZE_PIXELS + PADDING_PIXELS * 2;
	styleText(context);
	context.fillStyle = colourCss;
	context.fillText(text, PADDING_PIXELS, canvas.height / 2);

	const material = new SpriteMaterial({
		map: new CanvasTexture(canvas),
		transparent: true,
		opacity: LABEL_OPACITY,
		sizeAttenuation: false,
		depthTest: false,
		depthWrite: false,
		fog: false
	});
	const sprite = new Sprite(material);
	const aspect = canvas.width / canvas.height;
	sprite.scale.set(screenHeightShare * aspect, screenHeightShare, 1);
	return sprite;
}

function styleText(context: CanvasRenderingContext2D): void {
	context.font = FONT;
	context.textBaseline = 'middle';
	context.letterSpacing = LETTER_SPACING;
}
