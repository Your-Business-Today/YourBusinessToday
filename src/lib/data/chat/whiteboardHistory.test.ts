import { describe, expect, it } from 'vitest';
import { chatWhiteboardLimits, type WhiteboardStroke } from './chatWhiteboardRules';
import { canUndo, hasRoomForAnotherItem, historyAfterChange, historyAfterUndo, historyOpenedWith, historyWithItemAdded, mostUndoSteps } from './whiteboardHistory';

const line = (across: number): WhiteboardStroke => ({ tool: 'pen', colour: 'black', width: 3, points: [[across, 0], [across, 10]] });

describe('the history of a board open to draw on', () => {
	it('opens with nothing to undo', () => {
		const opened = historyOpenedWith([line(1)]);
		expect(canUndo(opened)).toBe(false);
		expect(historyAfterUndo(opened)).toBe(opened);
	});

	it('adds an item on top, and undoes it back to the board before', () => {
		const opened = historyOpenedWith([line(1)]);
		const drawn = historyWithItemAdded(opened, line(2));
		expect(drawn.items).toEqual([line(1), line(2)]);
		expect(historyAfterUndo(drawn).items).toEqual([line(1)]);
	});

	it('undoes an erase as it undoes a line, one change at a time, latest first', () => {
		const drawn = historyWithItemAdded(historyOpenedWith([]), line(1));
		const erased = historyAfterChange(drawn, []);
		expect(historyAfterUndo(erased).items).toEqual([line(1)]);
		expect(historyAfterUndo(historyAfterUndo(erased)).items).toEqual([]);
	});

	it('counts no change when the items are the same list, and keeps only the latest steps to undo', () => {
		const opened = historyOpenedWith([]);
		expect(historyAfterChange(opened, opened.items)).toBe(opened);
		let history = opened;
		for (let step = 0; step < mostUndoSteps + 5; step += 1) history = historyWithItemAdded(history, line(step));
		expect(history.earlier).toHaveLength(mostUndoSteps);
		expect(history.items).toHaveLength(mostUndoSteps + 5);
	});

	it('says when the board has no room for another item', () => {
		const full = historyOpenedWith(Array.from({ length: chatWhiteboardLimits.mostItemsOnABoard }, () => line(1)));
		expect(hasRoomForAnotherItem(full)).toBe(false);
		expect(hasRoomForAnotherItem(historyAfterUndo(historyAfterChange(full, [])))).toBe(false);
		expect(hasRoomForAnotherItem(historyAfterChange(full, []))).toBe(true);
	});
});
