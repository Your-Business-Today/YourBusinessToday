import { describe, expect, it } from 'vitest';
import { placeMeetingClose } from './placeMeetingClose';
import { meetingWithDecision } from './boardroomDecision.fixtures';
import { dayBeforeTheMeeting, duringTheMeeting, jeremysSeat, nigelsSeat } from './boardroomMeeting.fixtures';
import { closedMeeting } from './boardroomMinutes.fixtures';
import { boardMinutesRefusals } from './boardroomMinutesRules';

const asJeremy = { accountId: 'jeremy', now: duringTheMeeting };
const asNigel = { accountId: 'nigel', now: duringTheMeeting };

describe('the chair closes an open meeting, and is told what still waits', () => {
	it('lets only the chair close it while the chair sits', () => {
		expect(placeMeetingClose(meetingWithDecision(), asNigel)).toBe(boardMinutesRefusals.notTheMinuteTaker);
		expect(placeMeetingClose(meetingWithDecision(), asJeremy)).toMatchObject({ seatId: 'jeremys-seat' });
	});

	it('lets a sitting director who was on the meeting close it when the chair has stood down', () => {
		const record = meetingWithDecision();
		const stoodDown = { ...jeremysSeat, stoodDownAt: '2026-11-12T10:45:00.000Z' };
		const directors = [nigelsSeat, stoodDown];
		expect(placeMeetingClose({ ...record, directors }, asNigel)).toMatchObject({ seatId: 'nigels-seat' });
		const lateComer = { ...nigelsSeat, id: 'late-seat', accountId: 'late', namedAt: '2026-11-12T11:00:00.000Z' };
		expect(placeMeetingClose({ ...record, directors: [...directors, lateComer] }, { accountId: 'late', now: duringTheMeeting })).toBe(
			boardMinutesRefusals.notTheMinuteTaker
		);
	});

	it('names an item still in the room and a decision still waiting for answers', () => {
		const place = placeMeetingClose(meetingWithDecision({ answers: [] }), asJeremy);
		expect(place).toMatchObject({
			waiting: [
				{ number: 1, isInTheRoom: false, waitingFor: ['nigels-seat', 'jeremys-seat'] },
				{ number: 2, isInTheRoom: true, waitingFor: [] }
			]
		});
	});

	it('closes only an open meeting: not one still to come, nor one closed already', () => {
		const record = meetingWithDecision();
		const stillToCome = { ...record, meeting: { ...record.meeting, openedAt: null } };
		expect(placeMeetingClose(stillToCome, { accountId: 'jeremy', now: dayBeforeTheMeeting })).toBe(boardMinutesRefusals.meetingNotOpen);
		expect(placeMeetingClose(closedMeeting(), asJeremy)).toBe(boardMinutesRefusals.meetingNotOpen);
	});
});
