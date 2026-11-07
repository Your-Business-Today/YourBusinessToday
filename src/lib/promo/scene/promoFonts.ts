export const promoFonts = {
	display: '"Space Grotesk", "Inter", sans-serif',
	body: '"Inter", sans-serif'
};

const facesDrawnOnCanvas = [
	'700 64px "Space Grotesk"',
	'500 64px "Space Grotesk"',
	'400 64px "Space Grotesk"',
	'600 48px "Inter"',
	'500 48px "Inter"',
	'400 48px "Inter"'
];

/** Waits for the brand's fonts, so every word drawn into the 3D scene is drawn in them and not in a fallback. */
export async function loadPromoFonts(): Promise<void> {
	const { fonts } = document;
	await Promise.all(facesDrawnOnCanvas.map((face) => fonts.load(face)));
	await fonts.ready;
}

export function fontOf(weight: number, sizeInPixels: number, family: string): string {
	return `${weight} ${sizeInPixels}px ${family}`;
}
