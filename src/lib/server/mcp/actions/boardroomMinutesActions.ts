import { boardroomAction } from '../boardroomGate';
import { readText, type McpAction } from '../actionTypes';
import { validateMeetingClose } from '$lib/data/validateMeetingClose';
import { validateMinutesWords } from '$lib/data/validateMinutesWords';
import { validateMinutesAnswer } from '$lib/data/validateMinutesAnswer';
import { closeBoardroomMeeting } from '$lib/server/boardroom/closeBoardroomMeeting';
import { readMinutesOfMeeting } from '$lib/server/boardroom/readMinutesOfMeeting';
import { writeBoardroomMinutes } from '$lib/server/boardroom/writeBoardroomMinutes';
import { answerBoardroomMinutes } from '$lib/server/boardroom/answerBoardroomMinutes';
import { boardroomMinutesGuidance } from './boardroomMinutesGuidance';
import { meetingSchema } from './boardroomMeetingFields';
import { answerMinutesSchema, closeMeetingSchema, writeMinutesSchema } from './boardroomMinutesFields';

export const boardroomMinutesActions: McpAction[] = [
	boardroomAction({
		name: 'close_board_meeting',
		area: 'boardroom',
		audience: 'everyone',
		isWrite: true,
		summary: 'close a board meeting as its chair, once, on your director’s word: nothing more is said or answered after',
		guidance: boardroomMinutesGuidance.close,
		inputSchema: closeMeetingSchema,
		run: async (caller, input, organisation) => {
			const draft = validateMeetingClose(input);
			if (typeof draft === 'string') return draft;
			const director = { accountId: caller.accountId, now: new Date() };
			const closed = await closeBoardroomMeeting(caller.supabase, organisation, readText(input, 'meetingId'), draft, director);
			return closed.answer;
		}
	}),
	boardroomAction({
		name: 'read_board_minutes',
		area: 'boardroom',
		audience: 'everyone',
		isWrite: false,
		summary: "read a closed board meeting's record and every version of its minutes, with each director's answer",
		guidance: boardroomMinutesGuidance.read,
		inputSchema: meetingSchema,
		run: async (caller, input, organisation) => readMinutesOfMeeting(caller.supabase, organisation, readText(input, 'meetingId'), new Date())
	}),
	boardroomAction({
		name: 'write_board_minutes',
		area: 'boardroom',
		audience: 'everyone',
		isWrite: true,
		summary: "keep the minutes of a closed board meeting as the next numbered version, written from the room's record",
		guidance: boardroomMinutesGuidance.write,
		inputSchema: writeMinutesSchema,
		run: async (caller, input, organisation) => {
			const draft = validateMinutesWords(input);
			if (typeof draft === 'string') return draft;
			const director = { accountId: caller.accountId, now: new Date() };
			const written = await writeBoardroomMinutes(caller.supabase, organisation, readText(input, 'meetingId'), draft.words, director);
			return written.answer;
		}
	}),
	boardroomAction({
		name: 'answer_board_minutes',
		area: 'boardroom',
		audience: 'everyone',
		isWrite: true,
		summary: "record your director's own answer to the latest minutes: approves, or asks for a change, only as they told you",
		guidance: boardroomMinutesGuidance.answer,
		inputSchema: answerMinutesSchema,
		run: async (caller, input, organisation) => {
			const draft = validateMinutesAnswer(input);
			if (typeof draft === 'string') return draft;
			const director = { accountId: caller.accountId, now: new Date() };
			const answered = await answerBoardroomMinutes(caller.supabase, organisation, readText(input, 'meetingId'), draft, director);
			return answered.answer;
		}
	})
];
