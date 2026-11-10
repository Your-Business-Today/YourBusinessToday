import { beforeEach, describe, expect, it, vi } from 'vitest';
import { briefBoardroomItem } from './briefBoardroomItem';
import { boardBriefRefusals } from '$lib/data/boardroomBriefRules';
import { boardroomMeetingRefusals } from '$lib/data/boardroomMeetingRules';
import {
	agendaItem,
	calledMeeting,
	dayBeforeTheMeeting,
	duringTheMeeting,
	meetingId,
	nigelsSeat,
	yourBusinessToday
} from '$lib/data/boardroomMeeting.fixtures';
import type { BoardBriefDraft } from '$lib/data/boardroomBrief';
import type { MeetingRecord } from '$lib/data/describeBoardroomMeeting';

const board = vi.hoisted(() => ({ record: null as MeetingRecord | null, kept: [] as unknown[] }));
vi.mock('./readBoardroomMeeting', () => ({ getMeetingRecord: async () => board.record }));
vi.mock('./saveBoardroomBrief', () => ({
	insertBoardroomBrief: async (_supabase: unknown, placing: unknown) => board.kept.push(placing) && { briefId: 'brief', version: 3 }
}));

const nigel = { accountId: 'nigel', now: dayBeforeTheMeeting };
const draft: BoardBriefDraft = { itemNumber: 2, position: 'For it.', mayShare: null, mustNotShare: 'The price.', mustComeBack: null };

function brief(caller = nigel, given = draft) {
	return briefBoardroomItem({} as never, yourBusinessToday, meetingId, given, caller);
}

describe('a director briefs their own Claude on an agenda item', () => {
	beforeEach(() => {
		const items = [agendaItem(1, '2026-11-10T19:00:00Z'), agendaItem(2), agendaItem(3)];
		board.record = { meeting: calledMeeting, directors: [nigelsSeat], items, papers: [], recordPapers: [] };
		board.kept = [];
	});

	it('keeps the brief under the caller’s own seat, on the item numbered as the agenda reads now, and reads it back', async () => {
		const briefed = await brief();
		expect(briefed.isKept).toBe(true);
		expect(briefed.answer).toContain('Your brief on item 2, "Item 3", is kept as version 3.');
		expect(briefed.answer).toContain('It must not share: The price.');
		expect(board.kept).toEqual([{ meeting: calledMeeting, agendaItemId: 'item-3', seatId: 'nigels-seat', writtenBy: 'nigel' }]);
	});

	it('still takes a brief once the meeting has opened, so a director can steer their Claude', async () => {
		expect((await brief({ ...nigel, now: duringTheMeeting })).isKept).toBe(true);
	});

	it('refuses anyone without a sitting seat, so nobody briefs for another director', async () => {
		const briefed = await brief({ ...nigel, accountId: 'an-administrator' });
		expect(briefed).toEqual({ answer: boardBriefRefusals.callerHasNoSeat, isKept: false });
		expect(board.kept).toEqual([]);
	});

	it('refuses a number not on the agenda, a closed meeting, and a meeting the organisation does not have', async () => {
		expect((await brief(nigel, { ...draft, itemNumber: 3 })).answer).toBe(boardBriefRefusals.itemNotOnAgenda);
		board.record = { ...board.record!, meeting: { ...calledMeeting, closedAt: '2026-11-12T11:00:00Z' } };
		expect((await brief()).answer).toBe(boardBriefRefusals.meetingHasClosed);
		board.record = null;
		expect((await brief()).answer).toBe(boardroomMeetingRefusals.noSuchMeeting);
		expect(board.kept).toEqual([]);
	});
});
