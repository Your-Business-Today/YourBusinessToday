import { beforeEach, describe, expect, it, vi } from 'vitest';
import { addBoardroomPaper } from './addBoardroomPaper';
import { boardPaperRefusals } from '$lib/data/boardroomPaperRules';
import { boardroomMeetingRefusals } from '$lib/data/boardroomMeetingRules';
import {
	agendaItem,
	calledMeeting,
	dayBeforeTheMeeting,
	meetingId,
	nigelsSeat,
	yourBusinessToday
} from '$lib/data/boardroomMeeting.fixtures';
import type { BoardPaperDraft } from '$lib/data/boardroomPaper';
import type { MeetingRecord } from '$lib/data/describeBoardroomMeeting';

const board = vi.hoisted(() => ({ record: null as MeetingRecord | null, notes: [] as unknown[], grants: [] as unknown[] }));

vi.mock('./readBoardroomMeeting', () => ({ getMeetingRecord: async () => board.record }));
vi.mock('./saveBoardroomPaper', () => ({
	insertNotePaper: async (_supabase: unknown, placing: unknown) => board.notes.push(placing) && 'note-paper',
	grantPaperUpload: async (_supabase: unknown, placing: unknown) =>
		board.grants.push(placing) && { paperId: 'file-paper', uploadUrl: 'https://files.example/upload', expiresAt: '' }
}));

const supabase = {} as never;
const nigel = { accountId: 'nigel', now: dayBeforeTheMeeting };
const accountsNote: BoardPaperDraft = { itemNumber: 2, title: 'Accounts', content: { kind: 'note', note: 'Cash is up.' } };
const accountsFile: BoardPaperDraft = {
	...accountsNote,
	content: { kind: 'file', filename: 'accounts.pdf', mimeType: 'application/pdf', byteCount: 1000 }
};

function addPaper(draft: BoardPaperDraft, caller = nigel) {
	return addBoardroomPaper(supabase, yourBusinessToday, meetingId, draft, caller);
}

describe('putting a paper on an agenda item', () => {
	beforeEach(() => {
		const items = [agendaItem(1, '2026-11-10T19:00:00Z'), agendaItem(2), agendaItem(3)];
		board.record = { meeting: calledMeeting, directors: [nigelsSeat], items, papers: [], recordPapers: [] };
		board.notes = [];
		board.grants = [];
	});

	it('keeps a note on the item numbered as the agenda reads now, under the seat that added it', async () => {
		const answer = await addPaper(accountsNote);
		expect(answer).toContain('is on item 2 (paper note-paper)');
		expect(board.notes).toEqual([
			{ meeting: calledMeeting, agendaItemId: 'item-3', seatId: 'nigels-seat', addedBy: 'nigel', title: 'Accounts' }
		]);
	});

	it('grants a link for a file and says how to send it and record it', async () => {
		const answer = await addPaper(accountsFile);
		expect(answer).toContain('https://files.example/upload');
		expect(answer).toContain('record_board_paper_upload');
		expect(board.grants).toHaveLength(1);
	});

	it('refuses a number not on the agenda, withdrawn items not counted', async () => {
		expect(await addPaper({ ...accountsNote, itemNumber: 3 })).toBe(boardPaperRefusals.itemNotOnAgenda);
		expect(board.notes).toEqual([]);
	});

	it('refuses once the meeting has closed, and a meeting the organisation does not have', async () => {
		board.record = { ...board.record!, meeting: { ...calledMeeting, closedAt: '2026-11-12T11:00:00Z' } };
		expect(await addPaper(accountsFile)).toBe(boardPaperRefusals.meetingHasClosed);
		board.record = null;
		expect(await addPaper(accountsFile)).toBe(boardroomMeetingRefusals.noSuchMeeting);
		expect(board.grants).toEqual([]);
	});

	it('refuses anyone without a sitting seat on the board', async () => {
		expect(await addPaper(accountsNote, { ...nigel, accountId: 'james' })).toBe(boardPaperRefusals.callerHasNoSeat);
	});
});
