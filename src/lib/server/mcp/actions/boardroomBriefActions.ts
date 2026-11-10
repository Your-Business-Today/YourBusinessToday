import { boardroomAction } from '../boardroomGate';
import { readText, type McpAction } from '../actionTypes';
import { validateBoardroomBrief, validateBriefVersion } from '$lib/data/validateBoardroomBrief';
import { boardBriefRefusals } from '$lib/data/boardroomBriefRules';
import { validateItemNumber } from '$lib/data/boardPaperInput';
import { briefBoardroomItem } from '$lib/server/boardroom/briefBoardroomItem';
import { readOwnBoardroomBrief } from '$lib/server/boardroom/readBoardroomBrief';
import { boardroomBriefGuidance } from './boardroomBriefGuidance';
import { briefItemSchema, readBriefSchema } from './boardroomBriefFields';

export const boardroomBriefActions: McpAction[] = [
	boardroomAction({
		name: 'brief_board_item',
		area: 'boardroom',
		audience: 'everyone',
		isWrite: true,
		summary:
			'brief your own Claude on one item of a board meeting: your position, what it may and must not share, ' +
			'and what must come back to you; private to you',
		guidance: boardroomBriefGuidance.brief,
		inputSchema: briefItemSchema,
		run: async (caller, input, organisation) => {
			const draft = validateBoardroomBrief(input);
			if (typeof draft === 'string') return draft;
			const briefer = { accountId: caller.accountId, now: new Date() };
			const briefed = await briefBoardroomItem(caller.supabase, organisation, readText(input, 'meetingId'), draft, briefer);
			return briefed.answer;
		}
	}),
	boardroomAction({
		name: 'read_board_brief',
		area: 'boardroom',
		audience: 'everyone',
		isWrite: false,
		summary: 'read back your own brief on one item of a board meeting, the latest version or an earlier one',
		guidance: boardroomBriefGuidance.read,
		inputSchema: readBriefSchema,
		run: async (caller, input, organisation) => {
			const itemNumber = validateItemNumber(input.itemNumber);
			if (itemNumber === null) return boardBriefRefusals.itemNumberNotANumber;
			const version = validateBriefVersion(input);
			if (typeof version === 'string') return version;
			const reader = { accountId: caller.accountId, now: new Date() };
			const asked = { itemNumber, version };
			return readOwnBoardroomBrief(caller.supabase, organisation, readText(input, 'meetingId'), asked, reader);
		}
	})
];
