import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readOwnBoardroomBrief } from './readBoardroomBrief';
import { serviceRoleBriefTable } from './boardroomBriefTable.fixtures';
import { boardBriefRefusals } from '$lib/data/boardroomBriefRules';
import { boardroomMeetingRefusals } from '$lib/data/boardroomMeetingRules';
import { jeremysBrief, nigelsFirstBrief, nigelsSecondBrief } from '$lib/data/boardroomBrief.fixtures';
import {
	agendaItem,
	calledMeeting,
	dayBeforeTheMeeting,
	jeremysSeat,
	meetingId,
	nigelsSeat,
	yourBusinessToday
} from '$lib/data/boardroomMeeting.fixtures';
import type { MeetingRecord } from '$lib/data/describeBoardroomMeeting';

const board = vi.hoisted(() => ({ record: null as MeetingRecord | null }));
vi.mock('./readBoardroomMeeting', () => ({ getMeetingRecord: async () => board.record }));

const jamesSeat = { ...nigelsSeat, id: 'james-seat', accountId: 'james', name: 'James' };

function readAs(accountId: string, itemNumber = 1, version: number | null = null) {
	const table = serviceRoleBriefTable();
	const caller = { accountId, now: dayBeforeTheMeeting };
	const answer = readOwnBoardroomBrief(table.supabase, yourBusinessToday, meetingId, { itemNumber, version }, caller);
	return { answer, queriedTables: table.queriedTables };
}

describe('a director reads back their own brief, and nobody else’s', () => {
	beforeEach(() => {
		const record = { meeting: calledMeeting, directors: [nigelsSeat, jeremysSeat, jamesSeat], items: [agendaItem(1), agendaItem(2)] };
		board.record = { ...record, papers: [], recordPapers: [] };
	});

	it('gives Nigel his latest version, and an earlier one when he asks for it', async () => {
		const latest = await readAs('nigel').answer;
		expect(latest).toContain(nigelsSecondBrief.position);
		expect(latest).not.toContain(jeremysBrief.position);
		expect(await readAs('nigel', 1, 1).answer).toContain(nigelsFirstBrief.position);
		expect(await readAs('nigel', 1, 3).answer).toBe(boardBriefRefusals.noSuchVersion);
	});

	it('gives another director only their own, though the service role reads every row', async () => {
		const answer = await readAs('jeremy').answer;
		expect(answer).toContain(jeremysBrief.position);
		expect(answer).not.toContain(nigelsFirstBrief.position);
		expect(answer).not.toContain(nigelsSecondBrief.position);
	});

	it('tells a director who has not briefed so, though others have', async () => {
		expect(await readAs('james').answer).toBe(boardBriefRefusals.noBriefYet);
	});

	it('refuses an administrator who holds no seat before the briefs are ever read', async () => {
		const { answer, queriedTables } = readAs('an-administrator');
		expect(await answer).toBe(boardBriefRefusals.callerHasNoSeat);
		expect(queriedTables).toEqual([]);
	});

	it('refuses an item not on the agenda, and a meeting the organisation does not have', async () => {
		expect(await readAs('nigel', 3).answer).toBe(boardBriefRefusals.itemNotOnAgenda);
		board.record = null;
		expect(await readAs('nigel').answer).toBe(boardroomMeetingRefusals.noSuchMeeting);
	});
});
