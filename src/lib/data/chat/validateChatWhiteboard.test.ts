import { describe, expect, it } from 'vitest';
import { validateWhiteboardItems, validateWhiteboardSaving, validateWhiteboardTitle, whiteboardRoomRefusal } from './validateChatWhiteboard';
import { chatWhiteboardLimits, chatWhiteboardRefusals } from './chatWhiteboardRules';
import { chatMessageRefusals } from './chatMessageRules';

const { longestTitle, mostItemsOnABoard, mostPointsInAStroke, boardWidth, boardHeight } = chatWhiteboardLimits;
const stroke = { tool: 'pen', colour: 'black', width: 3, points: [[10, 10], [20, 20]] };
const savedAt = '2026-11-23T14:02:11.123456+00:00';
const finance = { id: 'finance', name: 'Finance', purpose: '', parentRoomId: null, isGeneral: false, isArchived: false };

const fullStroke = (place: number) => ({
	...stroke,
	width: 24,
	points: Array.from({ length: mostPointsInAStroke }, (_, step) => [(step * 7 + place) % boardWidth, (step * 3) % boardHeight])
});

describe('validateWhiteboardTitle', () => {
	it('takes a title trimmed, of 1 to the longest characters, and refuses any other', () => {
		expect(validateWhiteboardTitle(' Kitchen layout ')).toEqual({ title: 'Kitchen layout' });
		expect(validateWhiteboardTitle('a'.repeat(longestTitle))).toEqual({ title: 'a'.repeat(longestTitle) });
		for (const title of ['  ', 'a'.repeat(longestTitle + 1), 12, undefined]) expect(validateWhiteboardTitle(title)).toBe(chatWhiteboardRefusals.title);
	});
});

describe('validateWhiteboardItems', () => {
	it('takes the items as a list or as the text the page sends, and an empty board', () => {
		expect(validateWhiteboardItems([stroke])).toEqual([stroke]);
		expect(validateWhiteboardItems(JSON.stringify([stroke]))).toEqual([stroke]);
		expect(validateWhiteboardItems('[]')).toEqual([]);
	});

	it('refuses what is not a list, and names the first item that does not fit', () => {
		for (const value of ['{', '{}', 3, null]) expect(validateWhiteboardItems(value)).toBe(chatWhiteboardRefusals.itemsNotAList);
		expect(validateWhiteboardItems([stroke, { ...stroke, colour: 'pink' }])).toContain('strokes[1].colour');
	});

	it('refuses more items than a board holds, never dropping the extra ones', () => {
		expect(validateWhiteboardItems(Array.from({ length: mostItemsOnABoard }, () => stroke))).toHaveLength(mostItemsOnABoard);
		expect(validateWhiteboardItems(Array.from({ length: mostItemsOnABoard + 1 }, () => stroke))).toBe(chatWhiteboardRefusals.tooManyItems);
	});

	it('refuses a drawing larger than the bytes a board holds, though every item fits', () => {
		const heavy = Array.from({ length: 60 }, (_, place) => fullStroke(place));
		expect(validateWhiteboardItems(heavy)).toBe(chatWhiteboardRefusals.tooManyBytes);
	});
});

describe('validateWhiteboardSaving', () => {
	it('takes the title, the items and the moment the board was opened at', () => {
		expect(validateWhiteboardSaving({ title: 'Plan', strokes: '[]', openedAsSavedAt: savedAt })).toEqual({ title: 'Plan', items: [], openedAsSavedAt: savedAt });
	});

	it('refuses a save that does not say when the board was opened at', () => {
		for (const openedAsSavedAt of [undefined, '', 'yesterday']) {
			expect(validateWhiteboardSaving({ title: 'Plan', strokes: '[]', openedAsSavedAt })).toBe(chatWhiteboardRefusals.openedAsSavedAt);
		}
		expect(validateWhiteboardSaving({ title: '', strokes: '[]', openedAsSavedAt: savedAt })).toBe(chatWhiteboardRefusals.title);
	});
});

describe('whiteboardRoomRefusal', () => {
	it('lets a board be started or saved in an open room of the organisation only', () => {
		expect(whiteboardRoomRefusal(finance)).toBeNull();
		expect(whiteboardRoomRefusal({ ...finance, isArchived: true })).toBe(chatWhiteboardRefusals.archivedRoom);
		expect(whiteboardRoomRefusal(undefined)).toBe(chatMessageRefusals.noSuchRoom);
	});
});
