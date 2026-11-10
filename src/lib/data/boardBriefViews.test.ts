import { describe, expect, it } from 'vitest';
import { itemBriefingViewOf } from './boardBriefViews';
import { agendaItem, calledMeeting, dayBeforeTheMeeting, jeremysSeat, nigelsSeat } from './boardroomMeeting.fixtures';
import { jeremysBrief, nigelsFirstBrief, nigelsSecondBrief } from './boardroomBrief.fixtures';
import type { MeetingRecord } from './describeBoardroomMeeting';

const briefsIn = [
	{ agendaItemId: 'item-1', directorId: 'nigels-seat' },
	{ agendaItemId: 'item-1', directorId: 'jeremys-seat' }
];
const record: MeetingRecord = {
	meeting: calledMeeting,
	directors: [nigelsSeat, jeremysSeat],
	items: [agendaItem(1), agendaItem(2)],
	papers: [],
	recordPapers: [],
	briefing: { seatId: 'nigels-seat', ownBriefs: [nigelsFirstBrief, nigelsSecondBrief], briefsIn }
};

describe('an item’s briefs on the meeting page', () => {
	it('shows the reader their own latest brief, and the others only as in or not', () => {
		const view = itemBriefingViewOf(record, 'item-1', dayBeforeTheMeeting);
		expect(view.ownBrief).toMatchObject({ version: 2, position: nigelsSecondBrief.position, writtenWhen: '11 Nov 2026 at 09:00' });
		expect(view.briefedNames).toEqual(['Nigel', 'Jeremy']);
		expect(JSON.stringify(view)).not.toContain(jeremysBrief.position);
		expect(view.canBrief).toBe(true);
	});

	it('lists who has still to brief, and offers no form once the meeting has closed', () => {
		const closed = { ...record, meeting: { ...calledMeeting, closedAt: '2026-11-12T11:00:00Z' } };
		const view = itemBriefingViewOf(closed, 'item-2', dayBeforeTheMeeting);
		expect(view.ownBrief).toBeNull();
		expect(view.awaitedNames).toEqual(['Nigel', 'Jeremy']);
		expect(view.canBrief).toBe(false);
	});
});
