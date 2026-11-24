import { chatWhiteboardRefusals, whiteboardColours, whiteboardPenWidths, whiteboardTextSizes, whiteboardTools, type WhiteboardColour, type WhiteboardItem, type WhiteboardPoint, type WhiteboardStroke, type WhiteboardTool } from '$lib/data/chat/chatWhiteboardRules';
import { withItemsErasedAt } from '$lib/data/chat/whiteboardErasing';
import { hasRoomForAnotherItem, historyAfterChange, historyAfterUndo, historyOpenedWith, historyWithItemAdded } from '$lib/data/chat/whiteboardHistory';
import { isFarEnoughToDraw, isStrokeFull, strokeContinuedFrom, strokeStartedAt, strokeWithPointAdded, textPlacedAt } from '$lib/data/chat/whiteboardPen';

const [, usualPenWidth] = whiteboardPenWidths;
const [, usualTextSize] = whiteboardTextSizes;

/**
 * A board open to draw on: what is on it with what Undo goes back to, the tool, colour, width and text size in hand,
 * the line being drawn, where text is about to go, and whether anything has changed since it was last saved.
 */
export class WhiteboardBoard {
	history = $state(historyOpenedWith([]));
	tool = $state<WhiteboardTool>(whiteboardTools.pen);
	colour = $state<WhiteboardColour>(whiteboardColours[0]);
	penWidth = $state<number>(usualPenWidth);
	textSize = $state<number>(usualTextSize);
	stroke = $state<WhiteboardStroke | null>(null);
	textAt = $state<WhiteboardPoint | null>(null);
	isUnsaved = $state(false);
	notice = $state<string | null>(null);
	private itemsBeforeErasing: WhiteboardItem[] | null = null;

	constructor(items: WhiteboardItem[]) {
		this.history = historyOpenedWith(items);
	}

	get drawnItems(): WhiteboardItem[] {
		const { items } = this.history;
		return items;
	}

	get items(): WhiteboardItem[] {
		if (this.stroke === null) return this.drawnItems;
		return [...this.drawnItems, this.stroke];
	}

	press(point: WhiteboardPoint): void {
		this.notice = null;
		if (this.tool === whiteboardTools.text) this.textAt = point;
		if (this.tool === whiteboardTools.eraser) this.itemsBeforeErasing = this.drawnItems;
		if (this.itemsBeforeErasing !== null) this.eraseAt(point);
		const isDrawing = this.tool === whiteboardTools.pen && this.hasRoom();
		if (isDrawing) this.stroke = strokeStartedAt(point, this.colour, this.penWidth);
	}

	move(point: WhiteboardPoint): void {
		if (this.itemsBeforeErasing !== null) this.eraseAt(point);
		if (this.stroke === null || !isFarEnoughToDraw(this.stroke, point)) return;
		this.stroke = strokeWithPointAdded(this.stroke, point);
		if (isStrokeFull(this.stroke)) this.finishStroke(true);
	}

	release(): void {
		if (this.stroke !== null) this.finishStroke(false);
		if (this.itemsBeforeErasing === null) return;
		this.history = historyAfterChange({ ...this.history, items: this.itemsBeforeErasing }, this.drawnItems);
		this.itemsBeforeErasing = null;
	}

	placeText(text: string): void {
		if (this.textAt === null || !this.hasRoom()) return;
		this.add(textPlacedAt(this.textAt, text, this.colour, this.textSize));
		this.textAt = null;
	}

	undo(): void {
		this.history = historyAfterUndo(this.history);
		this.isUnsaved = true;
	}

	private finishStroke(isCarryingOn: boolean): void {
		const finished = this.stroke;
		if (finished === null) return;
		this.add(finished);
		this.stroke = isCarryingOn && this.hasRoom() ? strokeContinuedFrom(finished) : null;
	}

	private hasRoom(): boolean {
		const hasRoom = hasRoomForAnotherItem(this.history);
		if (!hasRoom) this.notice = chatWhiteboardRefusals.tooManyItems;
		return hasRoom;
	}

	private add(item: WhiteboardItem): void {
		this.history = historyWithItemAdded(this.history, item);
		this.isUnsaved = true;
	}

	private eraseAt(point: WhiteboardPoint): void {
		const kept = withItemsErasedAt(this.drawnItems, point);
		if (kept === this.drawnItems) return;
		this.history = { ...this.history, items: kept };
		this.isUnsaved = true;
	}
}
