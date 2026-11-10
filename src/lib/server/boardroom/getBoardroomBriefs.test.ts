import { describe, expect, it } from 'vitest';
import { getMeetingBriefing } from './getBoardroomBriefs';
import { serviceRoleBriefTable } from './boardroomBriefTable.fixtures';
import { agendaItem, calledMeeting, jeremysSeat, nigelsSeat } from '$lib/data/boardroomMeeting.fixtures';
import type { MeetingRecord } from '$lib/data/describeBoardroomMeeting';

const record: MeetingRecord = {
	meeting: calledMeeting,
	directors: [nigelsSeat, jeremysSeat],
	items: [agendaItem(1)],
	papers: [],
	recordPapers: []
};

describe('what one reader of a meeting knows of its briefs', () => {
	it('gives a director every version of their own brief and only whose others are in', async () => {
		const { supabase } = serviceRoleBriefTable();
		const briefing = await getMeetingBriefing(supabase, record, 'jeremy');
		expect(briefing.seatId).toBe('jeremys-seat');
		expect(briefing.ownBriefs.map((brief) => brief.id)).toEqual(['jeremys-brief']);
		expect(briefing.briefsIn).toContainEqual({ agendaItemId: 'item-1', directorId: 'nigels-seat' });
		expect(Object.keys(briefing.briefsIn[0])).toEqual(['agendaItemId', 'directorId']);
	});

	it('gives an administrator who holds no seat no brief at all, and never reads the briefs for them', async () => {
		const { supabase, queriedTables } = serviceRoleBriefTable();
		const briefing = await getMeetingBriefing(supabase, record, 'an-administrator');
		expect(briefing.ownBriefs).toEqual([]);
		expect(briefing.seatId).toBeNull();
		expect(queriedTables).toEqual([]);
	});
});
