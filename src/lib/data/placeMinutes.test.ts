import { describe, expect, it } from 'vitest';
import { placeMinutesAnswer, placeMinutesVersion } from './placeMinutes';
import { minutesApprovalOf } from './minutesApproval';
import { meetingWithDecision } from './boardroomDecision.fixtures';
import { duringTheMeeting } from './boardroomMeeting.fixtures';
import { afterTheMeeting, closedMeeting, minutesAnswered, writtenVersion } from './boardroomMinutes.fixtures';
import { boardMinutesRefusals } from './boardroomMinutesRules';
import type { MinutesAnswerDraft } from './validateMinutesAnswer';

const asJeremy = { accountId: 'jeremy', now: afterTheMeeting };
const asNigel = { accountId: 'nigel', now: afterTheMeeting };
const approving = (version: number): MinutesAnswerDraft => ({ version, answer: 'approves', changeWords: null });

describe('the chair’s Claude writes numbered versions of the minutes once the meeting has closed', () => {
	it('writes nothing while the meeting is open, and only the chair writes', () => {
		expect(placeMinutesVersion(meetingWithDecision(), { accountId: 'jeremy', now: duringTheMeeting })).toBe(boardMinutesRefusals.meetingNotClosed);
		expect(placeMinutesVersion(closedMeeting(), asNigel)).toBe(boardMinutesRefusals.notTheMinuteTaker);
		expect(placeMinutesVersion(closedMeeting(), asJeremy)).toEqual({ seatId: 'jeremys-seat', version: 1 });
	});

	it('numbers a change as the next version, and keeps every earlier one', () => {
		const record = closedMeeting({ versions: [writtenVersion(1)], answers: [minutesAnswered(1, 'nigels-seat', 'asks_for_change', 'Name the auditor.')] });
		expect(placeMinutesVersion(record, asJeremy)).toEqual({ seatId: 'jeremys-seat', version: 2 });
	});

	it('writes no further version once every director on the meeting has approved the same one', () => {
		const answers = [minutesAnswered(1, 'nigels-seat', 'approves'), minutesAnswered(1, 'jeremys-seat', 'approves')];
		const record = closedMeeting({ versions: [writtenVersion(1)], answers });
		expect(minutesApprovalOf(record, afterTheMeeting)).toMatchObject({ isApproved: true, hasChairApproved: true, waitingFor: [] });
		expect(placeMinutesVersion(record, asJeremy)).toBe(boardMinutesRefusals.minutesApproved);
	});
});

describe('each director answers the latest version themselves, once', () => {
	it('takes an answer only to the latest version, by its number', () => {
		const record = closedMeeting({ versions: [writtenVersion(1), writtenVersion(2)] });
		expect(placeMinutesAnswer(record, approving(1), asNigel)).toBe(boardMinutesRefusals.notTheLatestVersion);
		expect(placeMinutesAnswer(record, approving(2), asNigel)).toMatchObject({ seatId: 'nigels-seat', version: { version: 2 } });
	});

	it('refuses before any minutes are written, a second answer, and anyone with no seat', () => {
		expect(placeMinutesAnswer(closedMeeting(), approving(1), asNigel)).toBe(boardMinutesRefusals.noMinutesYet);
		const record = closedMeeting({ versions: [writtenVersion(1)], answers: [minutesAnswered(1, 'nigels-seat', 'approves')] });
		expect(placeMinutesAnswer(record, approving(1), asNigel)).toBe(boardMinutesRefusals.alreadyAnswered);
		expect(placeMinutesAnswer(record, approving(1), { accountId: 'an-administrator', now: afterTheMeeting })).toBe(boardMinutesRefusals.callerHasNoSeat);
	});

	it('starts a new version with no approvals: an approval belongs to its own version', () => {
		const answers = [minutesAnswered(1, 'nigels-seat', 'approves'), minutesAnswered(1, 'jeremys-seat', 'asks_for_change', 'Add the date.')];
		const record = closedMeeting({ versions: [writtenVersion(1), writtenVersion(2)], answers });
		const approval = minutesApprovalOf(record, afterTheMeeting);
		expect(approval).toMatchObject({ isApproved: false, approvedBy: [], waitingFor: ['nigels-seat', 'jeremys-seat'] });
	});
});
