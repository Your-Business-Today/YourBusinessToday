import { boardroomAction } from '../boardroomGate';
import { readText, type McpAction } from '../actionTypes';
import { validateBoardAction } from '$lib/data/validateBoardAction';
import { recordBoardAction } from '$lib/server/boardroom/recordBoardAction';
import { raiseActionsWhenAsked } from '$lib/server/boardroom/raiseCarriedActions';
import { boardroomActionGuidance } from './boardroomActionGuidance';
import { raiseActionsSchema, recordActionSchema } from './boardroomActionFields';

export const boardroomActionActions: McpAction[] = [
	boardroomAction({
		name: 'record_board_action',
		area: 'boardroom',
		audience: 'everyone',
		isWrite: true,
		summary: 'record an action the meeting agrees on an item for decision: what, who owns it, by when, and the project it goes to or none',
		guidance: boardroomActionGuidance.record,
		inputSchema: recordActionSchema,
		run: async (caller, input, organisation) => {
			const draft = validateBoardAction(input);
			if (typeof draft === 'string') return draft;
			const director = { accountId: caller.accountId, now: new Date(), isThroughClaude: true };
			const recorded = await recordBoardAction(caller.supabase, organisation, readText(input, 'meetingId'), draft, director);
			return recorded.answer;
		}
	}),
	boardroomAction({
		name: 'raise_board_actions',
		area: 'boardroom',
		audience: 'everyone',
		isWrite: true,
		summary: "raise, on your director's ask, the actions of a meeting's carried decisions that are not on their board",
		guidance: boardroomActionGuidance.raise,
		inputSchema: raiseActionsSchema,
		run: async (caller, input, organisation) => {
			const director = { accountId: caller.accountId, now: new Date() };
			const raised = await raiseActionsWhenAsked(caller.supabase, organisation, readText(input, 'meetingId'), director);
			return raised.answer;
		}
	})
];
