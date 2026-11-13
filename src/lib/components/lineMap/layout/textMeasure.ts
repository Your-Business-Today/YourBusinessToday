export type TextFont = { family: string; size: number; weight: number; lineHeight: number; baseline: number; averageCharacterWidth: number };
export type MeasureText = (text: string, font: TextFont) => number;

export const LabelFonts = {
	station: { family: 'Inter', size: 12, weight: 500, lineHeight: 15, baseline: 11, averageCharacterWidth: 0.51 },
	line: { family: 'Space Grotesk', size: 14, weight: 600, lineHeight: 17, baseline: 13, averageCharacterWidth: 0.52 }
} satisfies Record<string, TextFont>;

export const estimatedTextWidth: MeasureText = (text, font) => text.length * font.size * font.averageCharacterWidth;

export function cssFontOf(font: TextFont): string {
	return `${font.weight} ${font.size}px "${font.family}"`;
}

function canvasTextMeasure(): MeasureText {
	const context = document.createElement('canvas').getContext('2d');
	if (context === null) return estimatedTextWidth;
	return (text, font) => {
		context.font = cssFontOf(font);
		return context.measureText(text).width;
	};
}

export async function loadedTextMeasure(): Promise<MeasureText> {
	const fonts = Object.values(LabelFonts).map((font) => document.fonts.load(cssFontOf(font)));
	await Promise.all(fonts);
	return canvasTextMeasure();
}
