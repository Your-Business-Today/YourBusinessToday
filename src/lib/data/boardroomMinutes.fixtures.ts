import { meetingWithDecision } from './boardroomDecision.fixtures';
import { meetingId } from './boardroomMeeting.fixtures';
import { minutesFactsOf } from './minutesFacts';
import type { MeetingDecisions } from './boardroomDecision';
import type { MeetingMinutes, MinutesAnswer, MinutesAnswerKind, MinutesVersion } from './boardroomMinutes';
import type { MeetingRecord } from './describeBoardroomMeeting';

export const closedAt = '2026-11-12T12:00:00.000Z';
export const afterTheMeeting = new Date('2026-11-12T13:00:00Z');

/** The decisions fixtures' meeting, closed by Jeremy in the chair at noon, with whatever minutes it has. */
export function closedMeeting(minutes: Partial<MeetingMinutes> = {}, decisions: Partial<MeetingDecisions> = {}): MeetingRecord {
	const record = meetingWithDecision(decisions);
	const closing = { meetingId, closedByDirectorId: 'jeremys-seat', closedAt };
	const meeting = { ...record.meeting, closedAt };
	return { ...record, meeting, minutes: { closing, versions: [], answers: [], ...minutes } };
}

/** Version n of the closed meeting's minutes, written by Jeremy's Claude. */
export function writtenVersion(version: number): MinutesVersion {
	const facts = minutesFactsOf('Your Business Today', closedMeeting(), afterTheMeeting);
	const writtenAt = new Date(Date.UTC(2026, 10, 12, 13, version)).toISOString();
	const words = `The board talked the accounts through (version ${version}).`;
	return { id: `minutes-${version}`, meetingId, version, words, facts, writtenByDirectorId: 'jeremys-seat', writtenAt };
}

let minute = 0;

export function minutesAnswered(version: number, directorId: string, answer: MinutesAnswerKind, changeWords: string | null = null): MinutesAnswer {
	minute += 1;
	const givenAt = new Date(Date.UTC(2026, 10, 12, 14, minute)).toISOString();
	return { minutesId: `minutes-${version}`, directorId, answer, changeWords, givenAt };
}
