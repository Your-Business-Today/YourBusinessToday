import { describe, expect, it } from 'vitest';
import { chatWhiteboardLimits } from './chatWhiteboardRules';
import { boardPointAt, isFarEnoughToDraw, isStrokeFull, leastPenStep, strokeContinuedFrom, strokeStartedAt, strokeWithPointAdded, textPlacedAt } from './whiteboardPen';

const { boardWidth, boardHeight, mostPointsInAStroke } = chatWhiteboardLimits;
const phoneFrame = { left: 16, top: 200, width: 400, height: 225 };

describe('boardPointAt', () => {
	it('turns a point of the screen into the board’s own whole units, whatever size it is drawn at', () => {
		expect(boardPointAt(16, 200, phoneFrame)).toEqual([0, 0]);
		expect(boardPointAt(216, 312.5, phoneFrame)).toEqual([boardWidth / 2, boardHeight / 2]);
		expect(boardPointAt(16.1, 200.1, phoneFrame)).toEqual([0, 0]);
	});

	it('keeps a hand that strays past the edge on the board', () => {
		expect(boardPointAt(0, 1000, phoneFrame)).toEqual([0, boardHeight]);
		expect(boardPointAt(900, 0, phoneFrame)).toEqual([boardWidth, 0]);
	});
});

describe('drawing a line with the pen', () => {
	it('begins at the point and takes another only once the pen has moved far enough', () => {
		const stroke = strokeStartedAt([10, 10], 'green', 12);
		expect(stroke).toEqual({ tool: 'pen', colour: 'green', width: 12, points: [[10, 10]] });
		expect(isFarEnoughToDraw(stroke, [11, 10])).toBe(false);
		expect(isFarEnoughToDraw(stroke, [10 + leastPenStep, 10])).toBe(true);
		expect(strokeWithPointAdded(stroke, [12, 10]).points).toEqual([[10, 10], [12, 10]]);
		expect(stroke.points).toEqual([[10, 10]]);
	});

	it('carries a full line on in a new one from its end, in the same colour and width', () => {
		const full = { ...strokeStartedAt([0, 0], 'red', 6), points: Array.from({ length: mostPointsInAStroke }, (_, step) => [step, 1] as [number, number]) };
		expect(isStrokeFull(full)).toBe(true);
		expect(isStrokeFull(strokeStartedAt([0, 0], 'red', 6))).toBe(false);
		expect(strokeContinuedFrom(full)).toEqual({ tool: 'pen', colour: 'red', width: 6, points: [[mostPointsInAStroke - 1, 1]] });
	});
});

describe('textPlacedAt', () => {
	it('places the words at the point in the colour and size in hand', () => {
		expect(textPlacedAt([5, 50], 'Sink', 'blue', 28)).toEqual({ tool: 'text', colour: 'blue', size: 28, at: [5, 50], text: 'Sink' });
	});
});
