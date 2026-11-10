import { describe, expect, it } from 'vitest';
import { describeBoardroomMeeting, describeBoardroomMeetings } from './describeBoardroomMeeting';
import { ukMeetingTime } from './ukMeetingTime';
import type { AgendaItem, BoardroomMeeting } from './boardroomMeeting';
import type { BoardroomDirector } from './boardroomDirector';

const meeting: BoardroomMeeting = {
	id: 'meeting',
	organisationId: 'ybt',
	meetsAt: '2026-11-12T10:00:00.000Z',
	chairDirectorId: 'jeremys-seat',
	calledByDirectorId: 'nigels-seat',
	calledAt: '2026-11-10T18:00:00.000Z',
	openedAt: null,
	closedAt: null
};
const nigel: BoardroomDirector = {
	id: 'nigels-seat',
	organisationId: 'ybt',
	accountId: 'nigel',
	name: 'Nigel',
	namedAt: '2026-11-01T00:00:00Z',
	stoodDownAt: null
};
const jeremy: BoardroomDirector = {
	...nigel,
	id: 'jeremys-seat',
	accountId: 'jeremy',
	name: 'Jeremy'
};
const accounts: AgendaItem = {
	id: 'a',
	meetingId: 'meeting',
	position: 1,
	title: 'Approve the accounts',
	purpose: 'decision',
	isAnyOtherBusiness: false,
	withdrawnAt: null
};
const pensions: AgendaItem = {
	...accounts,
	id: 'b',
	position: 2,
	title: 'Pensions',
	purpose: 'noting',
	withdrawnAt: '2026-11-11T00:00:00Z'
};
const balance: AgendaItem = {
	...accounts,
	id: 'c',
	position: 3,
	title: 'Note the bank balance',
	purpose: 'noting',
	isAnyOtherBusiness: true
};
const now = new Date('2026-11-11T09:00:00Z');

describe('reading a board meeting', () => {
	it('gives the time on the UK clock, the chair, the board and the agenda numbered as change_board_agenda takes it', () => {
		const record = {
			meeting,
			directors: [nigel, jeremy],
			items: [accounts, pensions, balance],
			papers: [],
			recordPapers: []
		};
		const text = describeBoardroomMeeting('Your Business Today', record, now);
		expect(text).toContain('Board meeting of Your Business Today, 12 Nov 2026 at 10:00 (UK time): called.');
		expect(text).toContain('Chair: Jeremy. Called by Nigel on 10 Nov 2026 at 18:00.');
		expect(text).toContain('Directors on it: Nigel, Jeremy.');
		expect(text).toContain(
			'1. Approve the accounts — for decision\n2. Note the bank balance — to note (any other business)'
		);
		expect(text).toContain('Withdrawn before the meeting:\n- Pensions');
	});

	it('reads summer meetings an hour ahead of UTC', () => {
		expect(ukMeetingTime('2027-06-01T09:00:00.000Z')).toBe('1 Jun 2027 at 10:00');
	});

	it('lists the meetings, or says none has been called', () => {
		expect(describeBoardroomMeetings('YBT', [], now)).toContain('No board meeting of YBT has been called yet.');
		const listed = describeBoardroomMeetings('YBT', [{ meeting, itemCount: 2, chairName: 'Jeremy' }], now);
		expect(listed).toContain('- 12 Nov 2026 at 10:00, called: 2 agenda items, chaired by Jeremy (meeting meeting)');
	});
});
