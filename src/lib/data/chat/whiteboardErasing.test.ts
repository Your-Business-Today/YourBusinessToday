import { describe, expect, it } from 'vitest';
import { eraserReach, isItemTouchedAt, withItemsErasedAt } from './whiteboardErasing';
import type { WhiteboardStroke, WhiteboardText } from './chatWhiteboardRules';

const across: WhiteboardStroke = { tool: 'pen', colour: 'black', width: 6, points: [[100, 100], [300, 100]] };
const dot: WhiteboardStroke = { tool: 'pen', colour: 'red', width: 12, points: [[500, 500]] };
const words: WhiteboardText = { tool: 'text', colour: 'blue', size: 40, at: [800, 400], text: 'Door' };

describe('isItemTouchedAt', () => {
	it('touches a line anywhere along it within reach, and not beyond', () => {
		expect(isItemTouchedAt(across, [200, 100])).toBe(true);
		expect(isItemTouchedAt(across, [200, 100 + eraserReach + 3])).toBe(true);
		expect(isItemTouchedAt(across, [200, 100 + eraserReach + 4])).toBe(false);
		expect(isItemTouchedAt(across, [300 + eraserReach + 10, 100])).toBe(false);
	});

	it('touches a stroke of one point around that point', () => {
		expect(isItemTouchedAt(dot, [510, 500])).toBe(true);
		expect(isItemTouchedAt(dot, [540, 500])).toBe(false);
	});

	it('touches text where its words lie, above its baseline', () => {
		expect(isItemTouchedAt(words, [820, 390])).toBe(true);
		expect(isItemTouchedAt(words, [820, 300])).toBe(false);
		expect(isItemTouchedAt(words, [1000, 390])).toBe(false);
	});
});

describe('withItemsErasedAt', () => {
	it('takes off every item touched, whole, and keeps the rest in their order', () => {
		expect(withItemsErasedAt([across, dot, words], [150, 104])).toEqual([dot, words]);
	});

	it('gives back the same list when nothing is touched, so nothing counts as changed', () => {
		const items = [across, dot];
		expect(withItemsErasedAt(items, [1500, 800])).toBe(items);
	});
});
