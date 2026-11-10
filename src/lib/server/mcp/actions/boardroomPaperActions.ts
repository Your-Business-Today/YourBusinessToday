import { boardroomAction } from '../boardroomGate';
import { readText, type McpAction } from '../actionTypes';
import { validateBoardroomPaper } from '$lib/data/validateBoardroomPaper';
import { addBoardroomPaper } from '$lib/server/boardroom/addBoardroomPaper';
import { recordBoardroomPaperUpload } from '$lib/server/boardroom/recordBoardroomPaperUpload';
import { readBoardroomPaper } from '$lib/server/boardroom/readBoardroomPaper';
import { boardroomPaperGuidance } from './boardroomPaperGuidance';
import { addPaperSchema, paperSchema } from './boardroomPaperFields';

export const boardroomPaperActions: McpAction[] = [
	boardroomAction({
		name: 'add_board_paper',
		area: 'boardroom',
		audience: 'everyone',
		isWrite: true,
		summary: 'put a paper on an item of a board meeting as one of its directors: a written note, or a file sent through a link',
		guidance: boardroomPaperGuidance.add,
		inputSchema: addPaperSchema,
		run: async (caller, input, organisation) => {
			const draft = validateBoardroomPaper(input);
			if (typeof draft === 'string') return draft;
			const meetingCaller = { accountId: caller.accountId, now: new Date() };
			return addBoardroomPaper(caller.supabase, organisation, readText(input, 'meetingId'), draft, meetingCaller);
		}
	}),
	boardroomAction({
		name: 'record_board_paper_upload',
		area: 'boardroom',
		audience: 'everyone',
		isWrite: true,
		summary: 'keep the file sent to a link from add_board_paper as a paper on its agenda item',
		guidance: boardroomPaperGuidance.record,
		inputSchema: paperSchema,
		run: async (caller, input, organisation) => {
			const meetingCaller = { accountId: caller.accountId, now: new Date() };
			return recordBoardroomPaperUpload(caller.supabase, organisation, readText(input, 'paperId'), meetingCaller);
		}
	}),
	boardroomAction({
		name: 'read_board_paper',
		area: 'boardroom',
		audience: 'everyone',
		isWrite: false,
		summary: 'read one paper on a board meeting: a written note as its text, a file as a link to fetch it from',
		guidance: boardroomPaperGuidance.read,
		inputSchema: paperSchema,
		run: async (caller, input, organisation) => readBoardroomPaper(caller.supabase, organisation, readText(input, 'paperId'))
	})
];
