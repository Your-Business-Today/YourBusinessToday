import { breakLines, FilmType, headlineSizeFor } from './fitHeadline';
import { ShotWordPlaces } from '../content/contentPiece';
import type { ShotWords } from './filmOrder';
import type { WordBand } from './filmFrame';

/** One line of a shot's words as it is drawn: what it says, its size, where its top-left sits, and whether it is faded. */
export type PlacedLine = {
	text: string;
	size: number;
	x: number;
	y: number;
	isFaded: boolean;
};

/** The square the overline's accent dot is drawn as. */
export type PlacedDot = { x: number; y: number; size: number };

/** A shot's words laid on its band the way the film's stage lays them. */
export type PlacedWords = { lines: PlacedLine[]; dot: PlacedDot | null };

type WordBlock = {
	texts: string[];
	size: number;
	isFaded: boolean;
	isOverline: boolean;
};

const { sideLineSize, sideLineGap, headlineLineHeight } = FilmType;
const dotSize = Math.round(sideLineSize / 3);
const dotGap = 12;
const overlineIndent = dotSize + dotGap;

function blocksOf(words: ShotWords, band: WordBand): WordBlock[] {
	const sideLineCount = [words.overline, words.underline].filter((line) => line !== '').length;
	const headlineSize = headlineSizeFor(words.headline, band, sideLineCount);
	const blocks = [
		{ texts: [words.overline], size: sideLineSize, isFaded: false, isOverline: true },
		{ texts: breakLines(words.headline, headlineSize, band.width), size: headlineSize, isFaded: false, isOverline: false },
		{ texts: [words.underline], size: sideLineSize, isFaded: true, isOverline: false }
	];
	const written = blocks.map((block) => ({ ...block, texts: writtenTextsOf(block) }));
	return written.filter(hasWords);
}

function writtenTextsOf(block: WordBlock): string[] {
	const { texts } = block;
	return texts.filter((text) => text !== '');
}

function hasWords(block: WordBlock): boolean {
	const { texts } = block;
	return texts.length > 0;
}

function heightOf(block: WordBlock): number {
	const { texts } = block;
	return texts.length * block.size * headlineLineHeight;
}

/** Where the block of words starts: at the band's foot when the words sit at the bottom, otherwise at its top. */
function topOf(words: ShotWords, band: WordBand, blocks: WordBlock[]): number {
	const gaps = Math.max(0, blocks.length - 1) * sideLineGap;
	const blockHeight = blocks.reduce((total, block) => total + heightOf(block), gaps);
	const isAtBottom = words.wordsAt === ShotWordPlaces.bottom;
	return isAtBottom ? band.y + band.height - blockHeight : band.y;
}

/** The shot's words placed on its band, line by line, each line's leading split above and beneath it. */
export function placeWords(words: ShotWords, band: WordBand): PlacedWords {
	const blocks = blocksOf(words, band);
	const placed: PlacedWords = { lines: [], dot: null };
	let top = topOf(words, band, blocks);
	for (const block of blocks) {
		const lineHeight = block.size * headlineLineHeight;
		const x = block.isOverline ? band.x + overlineIndent : band.x;
		if (block.isOverline)
			placed.dot = { x: band.x, y: Math.round(top + (lineHeight - dotSize) / 2), size: dotSize };
		const leading = (lineHeight - block.size) / 2;
		block.texts.forEach((text, index) => {
			placed.lines.push({ text, size: block.size, x, y: Math.round(top + index * lineHeight + leading), isFaded: block.isFaded });
		});
		top += heightOf(block) + sideLineGap;
	}
	return placed;
}
