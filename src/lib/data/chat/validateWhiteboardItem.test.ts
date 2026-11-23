import { describe, expect, it } from 'vitest';
import { keptItemOf, whiteboardItemRefusal } from './validateWhiteboardItem';
import { chatWhiteboardLimits } from './chatWhiteboardRules';

const { boardWidth, boardHeight, mostPointsInAStroke, longestText } = chatWhiteboardLimits;
const stroke = { tool: 'pen', colour: 'red', width: 6, points: [[0, 0], [boardWidth, boardHeight]] };
const words = { tool: 'text', colour: 'blue', size: 40, at: [100, 200], text: 'Kitchen wall' };
const refusalOf = (item: unknown) => whiteboardItemRefusal('strokes[2]', item);

describe('whiteboardItemRefusal', () => {
	it('takes a pen stroke and a text item as the rules have them, edges of the board included', () => {
		expect(refusalOf(stroke)).toBeNull();
		expect(refusalOf(words)).toBeNull();
		expect(refusalOf({ ...stroke, points: [[10, 10]] })).toBeNull();
	});

	it('refuses an item that is not one, or is an eraser’s, naming where it is', () => {
		expect(refusalOf('a line')).toBe('strokes[2] is a pen stroke or a text item.');
		expect(refusalOf([stroke])).toBe('strokes[2] is a pen stroke or a text item.');
		expect(refusalOf({ ...stroke, tool: 'eraser' })).toContain('strokes[2].tool is one of pen, text');
	});

	it('refuses a colour off the palette, a width or size not listed', () => {
		expect(refusalOf({ ...stroke, colour: '#ff0000' })).toBe('strokes[2].colour is one of black, red, blue, green, amber.');
		expect(refusalOf({ ...stroke, width: 7 })).toBe('strokes[2].width is one of 3, 6, 12, 24.');
		expect(refusalOf({ ...words, size: 41 })).toBe('strokes[2].size is one of 28, 40, 56.');
	});

	it('refuses points off the board, not whole, not numbers, or too many, never cutting a stroke short', () => {
		for (const point of [[-1, 0], [0, boardHeight + 1], [boardWidth + 1, 0], [1.5, 2], ['1', 2], [Number.NaN, 0], [1, 2, 3]]) {
			expect(refusalOf({ ...stroke, points: [[0, 0], point] })).toContain('strokes[2].points[1] is two whole numbers on the board');
		}
		const tooMany = Array.from({ length: mostPointsInAStroke + 1 }, () => [5, 5]);
		expect(refusalOf({ ...stroke, points: tooMany })).toBe(`strokes[2].points has ${mostPointsInAStroke + 1} points; a stroke has 1 to ${mostPointsInAStroke}.`);
		expect(refusalOf({ ...stroke, points: [] })).toContain('has 0 points');
		expect(refusalOf({ ...stroke, points: 'here' })).toBe('strokes[2].points is a list of points on the board.');
	});

	it('refuses text that is blank, too long, more than one line, or placed off the board', () => {
		for (const text of [' ', 'a'.repeat(longestText + 1), 'two\nlines', 7]) {
			expect(refusalOf({ ...words, text })).toBe(`strokes[2].text is one line of 1 to ${longestText} characters.`);
		}
		expect(refusalOf({ ...words, text: 'a'.repeat(longestText) })).toBeNull();
		expect(refusalOf({ ...words, at: [boardWidth + 1, 0] })).toContain('strokes[2].at is two whole numbers on the board');
	});
});

describe('keptItemOf', () => {
	it('keeps only the fields the rules name', () => {
		expect(keptItemOf({ ...stroke, secret: 'x' })).toEqual(stroke);
		expect(keptItemOf({ ...words, points: [[1, 1]] })).toEqual(words);
	});
});
