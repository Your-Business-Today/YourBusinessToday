import { chatMessageRefusals } from './chatMessageRules';
import { chatWhiteboardLimits, chatWhiteboardRefusals, type ChatWhiteboardSaving, type WhiteboardItem } from './chatWhiteboardRules';
import { keptItemOf, whiteboardItemRefusal } from './validateWhiteboardItem';
import { whiteboardDrawingBytes } from './whiteboardDrawingBytes';
import type { ChatRoom } from './chatRoomRules';

const refusals = chatWhiteboardRefusals;
const itemsField = 'strokes';

/** The title trimmed when it is text of 1 to the longest characters, or the sentence saying it does not fit. */
export function validateWhiteboardTitle(value: unknown): string | { title: string } {
	if (typeof value !== 'string') return refusals.title;
	const title = value.trim();
	const isFitting = title.length > 0 && title.length <= chatWhiteboardLimits.longestTitle;
	if (!isFitting) return refusals.title;
	return { title };
}

/** The list as given, or as the text the page's save carries it in; null when it is neither. */
function listOf(value: unknown): unknown {
	if (typeof value !== 'string') return value;
	try {
		return JSON.parse(value);
	} catch {
		return null;
	}
}

/**
 * Every item on the board as the rules have it — a pen stroke or a text item, of the palette's colours, the listed
 * widths and sizes, on the board — under the most items and bytes a board holds; or the first refusal, naming where
 * it is and the limit. Nothing is cut to fit.
 */
export function validateWhiteboardItems(value: unknown): WhiteboardItem[] | string {
	const list = listOf(value);
	if (!Array.isArray(list)) return refusals.itemsNotAList;
	if (list.length > chatWhiteboardLimits.mostItemsOnABoard) return refusals.tooManyItems;
	for (const [place, item] of list.entries()) {
		const refusal = whiteboardItemRefusal(`${itemsField}[${place}]`, item);
		if (refusal !== null) return refusal;
	}
	const items = list.map(keptItemOf);
	if (whiteboardDrawingBytes(items) > chatWhiteboardLimits.largestDrawingBytes) return refusals.tooManyBytes;
	return items;
}

/** The title, the items and when the board had last been saved as the saver opened it, or what does not fit. */
export function validateWhiteboardSaving(input: Record<string, unknown>): ChatWhiteboardSaving | string {
	const titled = validateWhiteboardTitle(input.title);
	if (typeof titled === 'string') return titled;
	const items = validateWhiteboardItems(input.strokes);
	if (typeof items === 'string') return items;
	const openedAsSavedAt = typeof input.openedAsSavedAt === 'string' ? input.openedAsSavedAt.trim() : '';
	const isMoment = openedAsSavedAt !== '' && !Number.isNaN(Date.parse(openedAsSavedAt));
	if (!isMoment) return refusals.openedAsSavedAt;
	return { title: titled.title, items, openedAsSavedAt };
}

/** Why no whiteboard can be started or saved in the room, or null when it is open. */
export function whiteboardRoomRefusal(room: ChatRoom | undefined): string | null {
	if (room === undefined) return chatMessageRefusals.noSuchRoom;
	if (room.isArchived) return refusals.archivedRoom;
	return null;
}
