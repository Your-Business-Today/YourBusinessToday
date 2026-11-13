import type { MeasureText, TextFont } from './textMeasure';

export type WrappedLabel = { lines: string[]; width: number; height: number };

function widestOf(lines: string[], font: TextFont, measure: MeasureText): number {
	return Math.max(...lines.map((line) => measure(line, font)));
}

function evenestSplit(words: string[], font: TextFont, measure: MeasureText): string[] {
	const splits = words.slice(1).map((_, index) => [words.slice(0, index + 1).join(' '), words.slice(index + 1).join(' ')]);
	return splits.reduce((best, split) => (widestOf(split, font, measure) < widestOf(best, font, measure) ? split : best));
}

function wrappedLines(text: string, font: TextFont, widest: number, measure: MeasureText): string[] {
	const words = text.split(' ');
	const fitsOnOneLine = measure(text, font) <= widest;
	if (fitsOnOneLine || words.length === 1) return [text];
	return evenestSplit(words, font, measure);
}

export function wrapLabel(text: string, font: TextFont, widest: number, measure: MeasureText): WrappedLabel {
	const lines = wrappedLines(text, font, widest, measure);
	return { lines, width: widestOf(lines, font, measure), height: lines.length * font.lineHeight };
}
