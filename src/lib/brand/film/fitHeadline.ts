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

/** The words broken into lines at this size across this width, breaking only between words. */
export function breakLines(words: string, size: number, width: number): string[] {
	const lettersPerLine = Math.max(1, Math.floor(width / (size * averageGlyphWidth)));
	const lines: string[] = [];
	for (const word of words.split(/\s+/).filter((part) => part !== '')) {
		const lastLine = lines.at(-1);
		const isOverflowing = lastLine === undefined || lastLine.length + 1 + word.length > lettersPerLine;
		if (isOverflowing) lines.push(word);
		if (!isOverflowing) lines[lines.length - 1] = `${lastLine} ${word}`;
	}
	return lines;
}

/** How many lines the words take at this size across this width, breaking between words. */
export function linesAt(words: string, size: number, width: number): number {
	return Math.max(1, breakLines(words, size, width).length);
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
