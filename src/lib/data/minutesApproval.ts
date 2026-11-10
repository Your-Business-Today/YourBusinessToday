import { answeringSeatsOf } from './boardDecisionOnItem';
import { answersToVersion, latestVersionOf, minutesAnswers, noMeetingMinutes, type MinutesAnswer, type MinutesVersion } from './boardroomMinutes';
import type { MeetingRecord } from './describeBoardroomMeeting';

/**
 * Where the minutes stand: the latest version, every answer to it, who approved it, who asked for a change, who is
 * still to answer, whether the chair approved it, and whether every director on the meeting who still sits has.
 */
export type MinutesApproval = {
	version: MinutesVersion | null;
	answers: MinutesAnswer[];
	approvedBy: string[];
	changeAskedBy: string[];
	waitingFor: string[];
	hasChairApproved: boolean;
	isApproved: boolean;
};

function seatsAnswering(answers: MinutesAnswer[], kind: string): string[] {
	return answers.filter((answer) => answer.answer === kind).map((answer) => answer.directorId);
}

/** How the latest version of a meeting's minutes stands. An approval belongs to that one version alone. */
export function minutesApprovalOf(record: MeetingRecord, now: Date): MinutesApproval {
	const minutes = record.minutes ?? noMeetingMinutes;
	const version = latestVersionOf(minutes);
	const answers = version === null ? [] : answersToVersion(minutes, version.id);
	const approvedBy = seatsAnswering(answers, minutesAnswers.approves);
	const hasAnswered = (seatId: string) => answers.some((answer) => answer.directorId === seatId);
	const answering = answeringSeatsOf(record, now);
	const waitingFor = answering.filter((seatId) => !hasAnswered(seatId));
	const { meeting } = record;
	const isEveryOneFor = answering.length > 0 && answering.every((seatId) => approvedBy.includes(seatId));
	return {
		version,
		answers,
		approvedBy,
		changeAskedBy: seatsAnswering(answers, minutesAnswers.asksForChange),
		waitingFor,
		hasChairApproved: approvedBy.includes(meeting.chairDirectorId),
		isApproved: version !== null && isEveryOneFor
	};
}
