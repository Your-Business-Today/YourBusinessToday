import { chatWhiteboardLimits, type WhiteboardItem } from './chatWhiteboardRules';

/** How many changes back Undo can go while the board is open; the board saved is never undone. */
export const mostUndoSteps = 100;

/** What is on the board now, and what was on it before each change made since it was opened, latest last. */
export type WhiteboardHistory = { items: WhiteboardItem[]; earlier: WhiteboardItem[][] };

/** The board as it was opened, with nothing to undo. */
export function historyOpenedWith(items: WhiteboardItem[]): WhiteboardHistory {
	return { items, earlier: [] };
}

/** Whether another item can go on the board without passing the most a board holds. */
export function hasRoomForAnotherItem(history: WhiteboardHistory): boolean {
	const { items } = history;
	return items.length < chatWhiteboardLimits.mostItemsOnABoard;
}

/** The board after a change, with what it held before kept for Undo; unchanged when nothing changed. */
export function historyAfterChange(history: WhiteboardHistory, items: WhiteboardItem[]): WhiteboardHistory {
	if (items === history.items) return history;
	const earlier = [...history.earlier, history.items].slice(-mostUndoSteps);
	return { items, earlier };
}

/** The board with one more item drawn on it, latest on top. */
export function historyWithItemAdded(history: WhiteboardHistory, item: WhiteboardItem): WhiteboardHistory {
	return historyAfterChange(history, [...history.items, item]);
}

/** Whether there is a change to undo. */
export function canUndo(history: WhiteboardHistory): boolean {
	const { earlier } = history;
	return earlier.length > 0;
}

/** The board as it was before the last change, whether that drew, wrote or erased; unchanged with nothing to undo. */
export function historyAfterUndo(history: WhiteboardHistory): WhiteboardHistory {
	if (!canUndo(history)) return history;
	const { earlier } = history;
	return { items: earlier[earlier.length - 1], earlier: earlier.slice(0, -1) };
}
