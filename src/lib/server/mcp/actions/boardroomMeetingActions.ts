import { boardroomAction } from '../boardroomGate';
import { readText, type McpAction } from '../actionTypes';
import { validateMeetingCall } from '$lib/data/validateMeetingCall';
import { validateAgendaChange } from '$lib/data/validateAgendaChange';
import { callBoardroomMeeting } from '$lib/server/boardroom/callBoardroomMeeting';
import { changeBoardroomAgenda } from '$lib/server/boardroom/changeBoardroomAgenda';
import { listBoardroomMeetings, readBoardroomMeeting } from '$lib/server/boardroom/readBoardroomMeeting';
import { boardroomMeetingGuidance } from './boardroomMeetingGuidance';
import { callMeetingSchema, changeAgendaSchema, meetingSchema, organisationOnlySchema } from './boardroomMeetingFields';

export const boardroomMeetingActions: McpAction[] = [
	boardroomAction({
		name: 'call_board_meeting',
		area: 'boardroom',
		audience: 'everyone',
		isWrite: true,
		summary: "call a meeting of an organisation's board as one of its directors: when, who chairs it, and its agenda",
		guidance: boardroomMeetingGuidance.call,
		inputSchema: callMeetingSchema,
		run: async (caller, input, organisation) => {
			const now = new Date();
			const call = validateMeetingCall(input, now);
			if (typeof call === 'string') return call;
			return callBoardroomMeeting(caller.supabase, organisation, call, {
				accountId: caller.accountId,
				now
			});
		}
	}),
	boardroomAction({
		name: 'list_board_meetings',
		area: 'boardroom',
		audience: 'everyone',
		isWrite: false,
		summary: "list an organisation's board meetings, called, open and closed, latest first",
		guidance: boardroomMeetingGuidance.list,
		inputSchema: organisationOnlySchema,
		run: async (caller, _input, organisation) => listBoardroomMeetings(caller.supabase, organisation, new Date())
	}),
	boardroomAction({
		name: 'read_board_meeting',
		area: 'boardroom',
		audience: 'everyone',
		isWrite: false,
		summary: 'read one board meeting: when, who chairs it, the directors on it and its numbered agenda',
		guidance: boardroomMeetingGuidance.read,
		inputSchema: meetingSchema,
		run: async (caller, input, organisation) => {
			const reader = { accountId: caller.accountId, now: new Date() };
			return readBoardroomMeeting(caller.supabase, organisation, readText(input, 'meetingId'), reader);
		}
	}),
	boardroomAction({
		name: 'change_board_agenda',
		area: 'boardroom',
		audience: 'everyone',
		isWrite: true,
		summary:
			"change a board meeting's agenda: add, reword or withdraw items before it opens, add any other business after",
		guidance: boardroomMeetingGuidance.change,
		inputSchema: changeAgendaSchema,
		run: async (caller, input, organisation) => {
			const change = validateAgendaChange(input);
			if (typeof change === 'string') return change;
			const meetingCaller = { accountId: caller.accountId, now: new Date() };
			return changeBoardroomAgenda(caller.supabase, organisation, readText(input, 'meetingId'), change, meetingCaller);
		}
	})
];
