import { beforeEach, describe, expect, it, vi } from 'vitest';
import { changeBoardroomAgenda } from './changeBoardroomAgenda';
import { boardroomMeetingRefusals } from '$lib/data/boardroomMeetingRules';
import {
	agendaItem,
	calledMeeting,
	dayBeforeTheMeeting,
	duringTheMeeting,
	meetingId,
	yourBusinessToday
} from '$lib/data/boardroomMeeting.fixtures';
import type { AgendaItem, BoardroomMeeting } from '$lib/data/boardroomMeeting';
import type { AgendaChange } from '$lib/data/validateAgendaChange';

const board = vi.hoisted(() => ({
	meeting: null as BoardroomMeeting | null,
	items: [] as AgendaItem[],
	added: [] as unknown[],
	reworded: [] as string[],
	withdrawn: [] as string[]
}));

vi.mock('./getDirectorsOfOrganisation', () => ({ getDirectorsOfOrganisation: async () => [] }));
vi.mock('./getMeetingsOfOrganisation', () => ({
	getBoardroomMeeting: async () => board.meeting,
	getAgendaItemsOfMeetings: async () => board.items
}));
vi.mock('./getBoardroomPapers', () => ({ getKeptPapersOfMeeting: async () => [] }));
vi.mock('./getBoardroomRecordPapers', () => ({ getRecordPapersOfMeeting: async () => [] }));
vi.mock('./getBoardroomBriefs', () => ({ getMeetingBriefing: async () => ({ seatId: null, ownBriefs: [], briefsIn: [] }) }));
vi.mock('./getBoardroomRoom', () => ({ getRoomOfMeeting: async () => ({ room: null, contributions: [], outcomes: [] }) }));
vi.mock('./getBoardroomDecisions', async () => {
	const { noMeetingDecisions } = await import('$lib/data/boardroomDecision');
	return { getDecisionsOfMeeting: async () => noMeetingDecisions };
});
vi.mock('./saveBoardroomMeeting', () => ({
	insertAgendaItems: async (_supabase: unknown, placing: unknown, drafts: unknown[]) =>
		drafts.length > 0 && board.added.push(placing)
}));
vi.mock('./reviseAgendaItem', () => ({
	rewordAgendaItem: async (_supabase: unknown, itemId: string) => board.reworded.push(itemId),
	withdrawAgendaItem: async (_supabase: unknown, itemId: string) => board.withdrawn.push(itemId)
}));

const supabase = {} as never;
const newItem = { title: 'Note the bank balance', purpose: 'noting' as const };
const beforeItOpens = { accountId: 'nigel', now: dayBeforeTheMeeting };
const onceOpen = { accountId: 'nigel', now: duringTheMeeting };

function changeAgenda(changes: Partial<AgendaChange>, caller = beforeItOpens, id = meetingId) {
	const change = { add: [], reword: [], withdraw: [], ...changes };
	return changeBoardroomAgenda(supabase, yourBusinessToday, id, change, caller);
}

function placedAt(firstPosition: number, isAnyOtherBusiness: boolean) {
	return { meetingId, firstPosition, isAnyOtherBusiness, addedBy: 'nigel' };
}

describe("changing a board meeting's agenda", () => {
	beforeEach(() => {
		board.meeting = calledMeeting;
		board.items = [agendaItem(1), agendaItem(2, '2026-11-10T19:00:00Z'), agendaItem(3)];
		board.added = [];
		board.reworded = [];
		board.withdrawn = [];
	});

	it('rewords and withdraws by the numbers read now, and adds after every item ever placed', async () => {
		const reword = [{ number: 2, title: 'x', purpose: null }];
		const answer = await changeAgenda({ reword, withdraw: [1], add: [newItem] });
		expect(answer.startsWith('The agenda is changed.')).toBe(true);
		expect(board.reworded).toEqual(['item-3']);
		expect(board.withdrawn).toEqual(['item-1']);
		expect(board.added).toEqual([placedAt(4, false)]);
	});

	it('refuses a number not on the agenda before changing anything', async () => {
		const reword = [{ number: 1, title: 'x', purpose: null }];
		expect(await changeAgenda({ reword, withdraw: [3] })).toBe(boardroomMeetingRefusals.numberNotOnAgenda);
		expect(board.reworded).toEqual([]);
	});

	it('once the meeting has opened, adds only, as any other business', async () => {
		expect(await changeAgenda({ withdraw: [1] }, onceOpen)).toBe(boardroomMeetingRefusals.meetingHasOpened);
		await changeAgenda({ add: [newItem] }, onceOpen);
		expect(board.added).toEqual([placedAt(4, true)]);
		expect(board.withdrawn).toEqual([]);
	});

	it('changes nothing once the meeting has closed', async () => {
		board.meeting = { ...calledMeeting, closedAt: '2026-11-12T11:00:00.000Z' };
		expect(await changeAgenda({ add: [newItem] }, onceOpen)).toBe(boardroomMeetingRefusals.meetingHasClosed);
		expect(board.added).toEqual([]);
	});

	it('finds no meeting for an id that is not one', async () => {
		const answer = await changeAgenda({ add: [newItem] }, beforeItOpens, 'not-an-id');
		expect(answer).toBe(boardroomMeetingRefusals.noSuchMeeting);
	});
});
