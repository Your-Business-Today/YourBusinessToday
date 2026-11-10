import { beforeEach, describe, expect, it, vi } from 'vitest';
import { addBoardroomRecordPaper } from './addBoardroomRecordPaper';
import { boardPaperRefusals } from '$lib/data/boardroomPaperRules';
import { boardRecordPaperLimits, boardRecordPaperRefusals } from '$lib/data/boardroomRecordPaperRules';
import { agendaItem, calledMeeting, dayBeforeTheMeeting, meetingId, nigelsSeat, yourBusinessToday } from '$lib/data/boardroomMeeting.fixtures';
import type { BoardRecordPaperDraft, TakenReading } from '$lib/data/boardroomRecordPaper';
import type { MeetingRecord } from '$lib/data/describeBoardroomMeeting';

const board = vi.hoisted(() => ({ record: null as MeetingRecord | null, kept: [] as Record<string, unknown>[] }));

vi.mock('./readBoardroomMeeting', () => ({ getMeetingRecord: async () => board.record }));
vi.mock('./saveBoardroomRecordPaper', () => ({
	insertRecordPaper: async (_supabase: unknown, columns: Record<string, unknown>) => board.kept.push(columns)
}));

const supabase = {} as never;
const nigel = { accountId: 'nigel', now: dayBeforeTheMeeting };
const trialBalance: BoardRecordPaperDraft = {
	itemNumber: 2,
	title: 'Trial balance to October',
	asked: { source: 'trial_balance', periodStart: null, periodEnd: '2026-10-31', costCentreId: null, recordId: null }
};
const reading = 'Trial balance of Your Business Today at the end of 2026-10-31:\n- 1200 Bank (asset): debit £1,000.00';

function addPaper(taken: TakenReading, caller = nigel) {
	const takeReading = vi.fn(async () => taken);
	const answer = addBoardroomRecordPaper(supabase, yourBusinessToday, meetingId, trialBalance, { caller, takeReading });
	return { answer, takeReading };
}

describe('putting a paper from the records on an agenda item', () => {
	beforeEach(() => {
		const items = [agendaItem(1, '2026-11-10T19:00:00Z'), agendaItem(2), agendaItem(3)];
		board.record = { meeting: calledMeeting, directors: [nigelsSeat], items, papers: [], recordPapers: [] };
		board.kept = [];
	});

	it('keeps the reading word for word, with the moment it was taken, on the item numbered as the agenda reads now', async () => {
		const answer = await addPaper({ reading }).answer;
		expect(answer).toContain('"Trial balance to October" is on item 2');
		expect(answer).toContain('kept as it stood on 11 Nov 2026 at 10:00 (UK time)');
		expect(board.kept).toHaveLength(1);
		expect(board.kept[0]).toMatchObject({
			agenda_item_id: 'item-3',
			source: 'trial_balance',
			period_end: '2026-10-31',
			reading,
			taken_at: dayBeforeTheMeeting.toISOString(),
			added_by_director_id: 'nigels-seat'
		});
	});

	it('passes on why no reading was taken, and keeps nothing', async () => {
		const refusal = 'Books is not switched on for this organisation.';
		expect(await addPaper(refusal).answer).toBe(refusal);
		expect(board.kept).toEqual([]);
	});

	it('refuses a reading too long to keep', async () => {
		const tooLong = 'x'.repeat(boardRecordPaperLimits.longestReading + 1);
		expect(await addPaper({ reading: tooLong }).answer).toBe(boardRecordPaperRefusals.readingTooLong);
		expect(board.kept).toEqual([]);
	});

	it('takes no reading once the meeting has closed, nor for anyone without a seat', async () => {
		board.record = { ...board.record!, meeting: { ...calledMeeting, closedAt: '2026-11-11T09:00:00Z' } };
		const closed = addPaper({ reading });
		expect(await closed.answer).toBe(boardPaperRefusals.meetingHasClosed);
		expect(closed.takeReading).not.toHaveBeenCalled();
		board.record = { ...board.record!, meeting: calledMeeting };
		expect(await addPaper({ reading }, { ...nigel, accountId: 'james' }).answer).toBe(boardPaperRefusals.callerHasNoSeat);
		expect(board.kept).toEqual([]);
	});
});
