import { ukMeetingTime } from './ukMeetingTime';
import type { MeetingRecord } from './describeBoardroomMeeting';
import type { MinutesReader } from './boardMinutesViews';

/** The words the minute-taker pastes into their own Claude, so it writes the minutes: YBT calls no AI model itself. */
export function minutesPromptOf(record: MeetingRecord, reader: MinutesReader): string {
	const { meeting } = record;
	const meetingWords = `the board meeting of ${reader.organisationName} on ${ukMeetingTime(meeting.meetsAt)}`;
	return (
		`Write the minutes of ${meetingWords} in Your Business Today. Read the record with read_board_minutes ` +
		`(organisationId ${reader.organisationId}, meetingId ${meeting.id}) and write from it alone: what was said on ` +
		'each item in short, and the actions agreed. Answer any change a director asked for. Read the words back to me, ' +
		'and keep them with write_board_minutes on my yes.'
	);
}
