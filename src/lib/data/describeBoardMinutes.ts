import { meetingStage, meetingStages, nameOfSeat, standingAgenda } from './boardroomMeeting';
import { contributionsOnItem, emptyMeetingRoom } from './boardroomRoom';
import { saidSoFarLines } from './describeBoardContribution';
import { minutesFactsOf } from './minutesFacts';
import { minutesFactsLines } from './describeMinutesFacts';
import { minutesApprovalOf } from './minutesApproval';
import { minutesStandingWords } from './describeMinutesStanding';
import { ukMeetingTime } from './ukMeetingTime';
import { answersToVersion, latestVersionOf, noMeetingMinutes, versionsInOrder, type MinutesVersion } from './boardroomMinutes';
import type { MeetingRecord } from './describeBoardroomMeeting';

const notClosedWords = 'The meeting has not closed, so it has no minutes yet. The chair closes it with close_board_meeting.';

/** Beneath read_board_meeting once the meeting has closed: where its minutes stand. */
export function minutesLinesOnMeeting(record: MeetingRecord, now: Date): string[] {
	if (meetingStage(record.meeting, now) !== meetingStages.closed) return [];
	const standing = minutesStandingWords(minutesApprovalOf(record, now), record.directors);
	return ['', `Minutes: ${standing} Read them with read_board_minutes.`];
}

function saidOnItemsLines(record: MeetingRecord): string[] {
	const meetingRoom = record.room ?? emptyMeetingRoom;
	return standingAgenda(record.items).flatMap((item, index) => {
		const said = saidSoFarLines(contributionsOnItem(meetingRoom, item.id), record.directors);
		return ['', `Item ${index + 1}, ${item.title}:`, ...said];
	});
}

function versionLines(record: MeetingRecord, version: MinutesVersion): string[] {
	const minutes = record.minutes ?? noMeetingMinutes;
	const writer = nameOfSeat(record.directors, version.writtenByDirectorId);
	const answers = answersToVersion(minutes, version.id).map((answer) => {
		const change = answer.changeWords === null ? '' : `: ${answer.changeWords}`;
		return `- ${nameOfSeat(record.directors, answer.directorId)} ${answer.answer}, ${ukMeetingTime(answer.givenAt)}${change}`;
	});
	const heading = `Version ${version.version}, written by ${writer} on ${ukMeetingTime(version.writtenAt)}:`;
	return ['', heading, version.words, ...(answers.length === 0 ? ['No answers yet.'] : ['Answers:', ...answers])];
}

/**
 * read_board_minutes: the record of a closed meeting as the minute-taker's Claude writes from it (the facts the
 * service puts in, and what was said on each item), then every version of the minutes with every answer.
 */
export function describeBoardMinutes(organisationName: string, record: MeetingRecord, now: Date): string {
	if (meetingStage(record.meeting, now) !== meetingStages.closed) return notClosedWords;
	const minutes = record.minutes ?? noMeetingMinutes;
	const latest = latestVersionOf(minutes);
	const facts = latest === null ? minutesFactsOf(organisationName, record, now) : latest.facts;
	const standing = minutesStandingWords(minutesApprovalOf(record, now), record.directors);
	const versions = versionsInOrder(minutes).flatMap((version) => versionLines(record, version));
	const roomLines = ['', 'What was said in the room, item by item:', ...saidOnItemsLines(record)];
	return [...minutesFactsLines(facts), ...roomLines, '', `Where the minutes stand: ${standing}`, ...versions].join('\n');
}
