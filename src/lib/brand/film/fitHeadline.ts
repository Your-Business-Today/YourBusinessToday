import type { WordBand } from './filmFrame';

/** The type of a shot's words, in the frame's pixels, as the kit's film sets them. */
export const FilmType = {
	largestHeadline: 96,
	smallestHeadline: 28,
	headlineLineHeight: 1.06,
	headlineWeight: 500,
	averageGlyphWidth: 0.52,
	sideLineSize: 30,
	sideLineGap: 18,
	sizeStep: 2
} as const;

const { largestHeadline, smallestHeadline, headlineLineHeight, averageGlyphWidth, sideLineSize, sideLineGap, sizeStep } = FilmType;

/** How many lines the words take at this size across this width, breaking between words. */
export function linesAt(words: string, size: number, width: number): number {
	const lettersPerLine = Math.max(1, Math.floor(width / (size * averageGlyphWidth)));
	let lines = 1;
	let lineLength = 0;
	for (const word of words.split(/\s+/).filter((part) => part !== '')) {
		const isOverflowing = lineLength > 0 && lineLength + 1 + word.length > lettersPerLine;
		lines += isOverflowing ? 1 : 0;
		lineLength = isOverflowing ? word.length : lineLength + (lineLength > 0 ? 1 : 0) + word.length;
	}
	return lines;
}

/** The largest headline size that fits the band beside the lines above and beneath it: made smaller, never cut off. */
export function headlineSizeFor(headline: string, band: WordBand, sideLineCount: number): number {
	const roomForSideLines = sideLineCount * (sideLineSize * headlineLineHeight + sideLineGap);
	const room = band.height - roomForSideLines;
	for (let size = largestHeadline; size > smallestHeadline; size -= sizeStep) {
		const height = linesAt(headline, size, band.width) * size * headlineLineHeight;
		if (height <= room) return size;
	}
	return smallestHeadline;
}
