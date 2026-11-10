import { describe, expect, it } from 'vitest';
import { boardMeetingRowsOf } from './boardMeetingRows';
import { calledMeeting, dayBeforeTheMeeting, duringTheMeeting } from './boardroomMeeting.fixtures';

const closedMeeting = { ...calledMeeting, id: 'closed', closedAt: '2026-11-12T11:00:00.000Z' };
const summaries = [
	{ meeting: calledMeeting, itemCount: 2, chairName: 'Jeremy' },
	{ meeting: closedMeeting, itemCount: 1, chairName: 'Nigel' }
];

describe('the boardroom page lists its meetings', () => {
	it('with when each meets on the UK clock, its stage, its chair and the length of its agenda', () => {
		const [called, closed] = boardMeetingRowsOf(summaries, dayBeforeTheMeeting);
		expect(called).toEqual({
			id: calledMeeting.id,
			meetsAt: calledMeeting.meetsAt,
			when: '12 Nov 2026 at 10:00',
			stage: 'called',
			chairName: 'Jeremy',
			itemCount: 2
		});
		expect(closed.stage).toBe('closed');
	});

	it('reads a called meeting as open once its time has come', () => {
		const [meeting] = boardMeetingRowsOf(summaries, duringTheMeeting);
		expect(meeting.stage).toBe('open');
	});
});
