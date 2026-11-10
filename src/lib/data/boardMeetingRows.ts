import { meetingStage, type MeetingStage } from './boardroomMeeting';
import { ukMeetingTime } from './ukMeetingTime';
import type { MeetingSummary } from './describeBoardroomMeeting';

/** One meeting as the boardroom page lists it: when, where it stands, who chairs it and how long its agenda is. */
export type BoardMeetingRow = {
	id: string;
	meetsAt: string;
	when: string;
	stage: MeetingStage;
	chairName: string;
	itemCount: number;
};

function rowOf(summary: MeetingSummary, now: Date): BoardMeetingRow {
	const meeting = summary.meeting;
	return {
		id: meeting.id,
		meetsAt: meeting.meetsAt,
		when: ukMeetingTime(meeting.meetsAt),
		stage: meetingStage(meeting, now),
		chairName: summary.chairName,
		itemCount: summary.itemCount
	};
}

/** The board's meetings as rows, in the order given: latest first. */
export function boardMeetingRowsOf(summaries: MeetingSummary[], now: Date): BoardMeetingRow[] {
	return summaries.map((summary) => rowOf(summary, now));
}
