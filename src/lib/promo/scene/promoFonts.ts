const displayFamily = '"Space Grotesk"';

export const promoFonts = {
	display: `${displayFamily}, "Inter", sans-serif`,
	body: '"Inter", sans-serif'
};

const facesDrawnOnCanvas = [
	`700 64px ${displayFamily}`,
	`500 64px ${displayFamily}`,
	`400 64px ${displayFamily}`,
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
