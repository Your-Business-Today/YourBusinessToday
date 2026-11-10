import { boardroomAction } from '../boardroomGate';
import { readText, type McpAction } from '../actionTypes';
import { validateBoardContribution, validateRoundsLimit } from '$lib/data/validateBoardContribution';
import { validateItemNumber } from '$lib/data/boardPaperInput';
import { boardRoomRefusals } from '$lib/data/boardroomRoomRules';
import { openBoardroomRoom } from '$lib/server/boardroom/openBoardroomRoom';
import { readItemInTheRoom } from '$lib/server/boardroom/readItemInTheRoom';
import { speakOnBoardroomItem } from '$lib/server/boardroom/speakOnBoardroomItem';
import { boardroomRoomGuidance } from './boardroomRoomGuidance';
import { openRoomSchema, readItemSchema, speakSchema } from './boardroomRoomFields';

export const boardroomRoomActions: McpAction[] = [
	boardroomAction({
		name: 'open_board_room',
		area: 'boardroom',
		audience: 'everyone',
		isWrite: true,
		summary: "open a board meeting's room for the directors' Claudes, from the meeting's time, with the most rounds each item takes",
		guidance: boardroomRoomGuidance.open,
		inputSchema: openRoomSchema,
		run: async (caller, input, organisation) => {
			const roundsLimit = validateRoundsLimit(input);
			if (typeof roundsLimit === 'string') return roundsLimit;
			const opener = { accountId: caller.accountId, now: new Date() };
			return openBoardroomRoom(caller.supabase, organisation, readText(input, 'meetingId'), roundsLimit, opener);
		}
	}),
	boardroomAction({
		name: 'read_board_item',
		area: 'boardroom',
		audience: 'everyone',
		isWrite: false,
		summary: 'read one agenda item in the room: its papers, your own brief, everything said on it so far, and where it stands',
		guidance: boardroomRoomGuidance.read,
		inputSchema: readItemSchema,
		run: async (caller, input, organisation) => {
			const itemNumber = validateItemNumber(input.itemNumber);
			if (itemNumber === null) return boardRoomRefusals.itemNumberNotANumber;
			const reader = { accountId: caller.accountId, now: new Date() };
			return readItemInTheRoom(caller.supabase, organisation, readText(input, 'meetingId'), itemNumber, reader);
		}
	}),
	boardroomAction({
		name: 'speak_on_board_item',
		area: 'boardroom',
		audience: 'everyone',
		isWrite: true,
		summary: 'say your piece on an agenda item in the room, for your own director, in your turn: propose, support, object or comment',
		guidance: boardroomRoomGuidance.speak,
		inputSchema: speakSchema,
		run: async (caller, input, organisation) => {
			const draft = validateBoardContribution(input);
			if (typeof draft === 'string') return draft;
			const speaker = { accountId: caller.accountId, now: new Date() };
			return speakOnBoardroomItem(caller.supabase, organisation, readText(input, 'meetingId'), draft, speaker);
		}
	})
];
