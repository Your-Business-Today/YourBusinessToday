import { meetingStage, meetingStages, nameOfSeat } from './boardroomMeeting';
import { itemsWaitingAt, minuteTakerSeat } from './placeMeetingClose';
import { minutesApprovalOf } from './minutesApproval';
import { minutesFactsLines } from './describeMinutesFacts';
import { minutesStandingWords } from './describeMinutesStanding';
import { closeWaitingLines } from './describeMinutesKept';
import { minutesPromptOf } from './describeMinutesPrompt';
import { seatInRoom } from './boardroomRoomTurns';
import { ukMeetingTime } from './ukMeetingTime';
import { answersToVersion, noMeetingMinutes, versionsInOrder, type MinutesAnswerKind, type MinutesVersion } from './boardroomMinutes';
import type { MeetingRecord } from './describeBoardroomMeeting';

/** One director's answer to a version, as every director reads it on the meeting's page. */
export type MinutesAnswerView = { directorName: string; answer: MinutesAnswerKind; changeWords: string | null; when: string };

/** One version of the minutes as the page shows it: the facts the service put in, the Claude's words, and every answer. */
export type MinutesVersionView = { number: number; writerName: string; when: string; facts: string; words: string; answers: MinutesAnswerView[] };

/** Closing the meeting as the page offers it: only to the minute-taker while it is open, with what still waits. */
export type MeetingCloseView = { canClose: boolean; waitingLines: string[] };

/** The minutes as the page shows them once the meeting has closed, and what the reader may do with them. */
export type MeetingMinutesView = {
	isClosed: boolean;
	versions: MinutesVersionView[];
	standingWords: string;
	isApproved: boolean;
	latestVersion: number | null;
	canAnswer: boolean;
	prompt: string | null;
};

/** Where the reader stands on the meeting: their account, the organisation's name, and when they read it. */
export type MinutesReader = { accountId: string; organisationId: string; organisationName: string; now: Date };

function versionView(record: MeetingRecord, version: MinutesVersion): MinutesVersionView {
	const minutes = record.minutes ?? noMeetingMinutes;
	const { directors } = record;
	const answers = answersToVersion(minutes, version.id).map((given) => ({
		directorName: nameOfSeat(directors, given.directorId),
		answer: given.answer,
		changeWords: given.changeWords,
		when: ukMeetingTime(given.givenAt)
	}));
	const writerName = nameOfSeat(directors, version.writtenByDirectorId);
	const facts = minutesFactsLines(version.facts).join('\n');
	return { number: version.version, writerName, when: ukMeetingTime(version.writtenAt), facts, words: version.words, answers };
}

export function meetingCloseViewOf(record: MeetingRecord, reader: MinutesReader): MeetingCloseView {
	const isOpen = meetingStage(record.meeting, reader.now) === meetingStages.open;
	const isMinuteTaker = minuteTakerSeat(record, reader.accountId, reader.now) !== null;
	if (!isOpen || !isMinuteTaker) return { canClose: false, waitingLines: [] };
	return { canClose: true, waitingLines: closeWaitingLines(itemsWaitingAt(record, reader.now), record.directors) };
}

export function meetingMinutesViewOf(record: MeetingRecord, reader: MinutesReader): MeetingMinutesView {
	const { now } = reader;
	const isClosed = meetingStage(record.meeting, now) === meetingStages.closed;
	const approval = minutesApprovalOf(record, now);
	const { version } = approval;
	const readerSeat = seatInRoom(record, reader.accountId, now);
	const canAnswer = isClosed && version !== null && readerSeat !== null && approval.waitingFor.includes(readerSeat.id);
	const isWriting = isClosed && !approval.isApproved && minuteTakerSeat(record, reader.accountId, now) !== null;
	return {
		isClosed,
		versions: versionsInOrder(record.minutes ?? noMeetingMinutes).map((kept) => versionView(record, kept)).reverse(),
		standingWords: minutesStandingWords(approval, record.directors),
		isApproved: approval.isApproved,
		latestVersion: version === null ? null : version.version,
		canAnswer,
		prompt: isWriting ? minutesPromptOf(record, reader) : null
	};
}
