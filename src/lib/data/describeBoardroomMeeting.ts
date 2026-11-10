import { ukMeetingTime } from './ukMeetingTime';
import { paperLinesOfItem } from './describeBoardroomPaper';
import {
	directorsOnMeeting,
	meetingStage,
	nameOfSeat,
	standingAgenda,
	type AgendaItem,
	type BoardroomMeeting
} from './boardroomMeeting';
import type { BoardroomDirector } from './boardroomDirector';
import type { BoardroomPaper } from './boardroomPaper';

/** Everything a director reads of one meeting: the meeting, its board, every item ever put on its agenda and their papers. */
export type MeetingRecord = {
	meeting: BoardroomMeeting;
	directors: BoardroomDirector[];
	items: AgendaItem[];
	papers: BoardroomPaper[];
};

const purposeWords = { decision: 'for decision', noting: 'to note' } as const;
const anyOtherBusinessWords = ' (any other business)';

function agendaLine(item: AgendaItem, index: number): string {
	const aside = item.isAnyOtherBusiness ? anyOtherBusinessWords : '';
	return `${index + 1}. ${item.title} — ${purposeWords[item.purpose]}${aside}`;
}

function agendaLines(record: MeetingRecord): string[] {
	const agenda = standingAgenda(record.items);
	return agenda.flatMap((item, index) => [agendaLine(item, index), ...paperLinesOfItem(record.papers, item.id, record.directors)]);
}

function withdrawnLines(items: AgendaItem[]): string[] {
	const withdrawn = items.filter((item) => item.withdrawnAt !== null).map((item) => `- ${item.title}`);
	if (withdrawn.length === 0) return [];
	return ['', 'Withdrawn before the meeting:', ...withdrawn];
}

function meetingHeading(organisationName: string, record: MeetingRecord, now: Date): string[] {
	const meeting = record.meeting;
	const onIt = directorsOnMeeting(record.directors, meeting, now).map((director) => director.name);
	const calledBy = nameOfSeat(record.directors, meeting.calledByDirectorId);
	return [
		`Board meeting of ${organisationName}, ${ukMeetingTime(meeting.meetsAt)} (UK time): ${meetingStage(meeting, now)}.`,
		`Meeting id: ${meeting.id}`,
		`Chair: ${nameOfSeat(record.directors, meeting.chairDirectorId)}. Called by ${calledBy} on ${ukMeetingTime(meeting.calledAt)}.`,
		`Directors on it: ${onIt.join(', ')}.`
	];
}

/** One meeting as read_board_meeting gives it: its numbers are the ones change_board_agenda takes. */
export function describeBoardroomMeeting(organisationName: string, record: MeetingRecord, now: Date): string {
	const agenda = agendaLines(record);
	const heading = meetingHeading(organisationName, record, now);
	return [...heading, '', 'Agenda:', ...agenda, ...withdrawnLines(record.items)].join('\n');
}

export type MeetingSummary = {
	meeting: BoardroomMeeting;
	itemCount: number;
	chairName: string;
};

function summaryLine(summary: MeetingSummary, now: Date): string {
	const meeting = summary.meeting;
	const when = ukMeetingTime(meeting.meetsAt);
	return `- ${when}, ${meetingStage(meeting, now)}: ${summary.itemCount} agenda items, chaired by ${summary.chairName} (meeting ${meeting.id})`;
}

/** An organisation's meetings as list_board_meetings gives them, latest first. */
export function describeBoardroomMeetings(organisationName: string, summaries: MeetingSummary[], now: Date): string {
	if (summaries.length === 0)
		return `No board meeting of ${organisationName} has been called yet. Call one with call_board_meeting.`;
	const lines = summaries.map((summary) => summaryLine(summary, now));
	return [`Board meetings of ${organisationName}, latest first:`, ...lines].join('\n');
}
