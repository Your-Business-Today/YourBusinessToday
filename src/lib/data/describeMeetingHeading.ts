import { ukMeetingTime } from './ukMeetingTime';
import { directorsOnMeeting, meetingStage, nameOfSeat } from './boardroomMeeting';
import { noMeetingDecisions } from './boardroomDecision';
import { decisionRuleSentence } from './describeDecisionRule';
import type { MeetingRecord } from './describeBoardroomMeeting';

/** The top of read_board_meeting: when and where the meeting stands, who chairs it, who is on it, and how its decisions carry. */
export function meetingHeading(organisationName: string, record: MeetingRecord, now: Date): string[] {
	const { meeting, directors } = record;
	const onIt = directorsOnMeeting(directors, meeting, now).map((director) => director.name);
	const calledBy = nameOfSeat(directors, meeting.calledByDirectorId);
	const { ruleInForce } = record.decisions ?? noMeetingDecisions;
	return [
		`Board meeting of ${organisationName}, ${ukMeetingTime(meeting.meetsAt)} (UK time): ${meetingStage(meeting, now)}.`,
		`Meeting id: ${meeting.id}`,
		`Chair: ${nameOfSeat(directors, meeting.chairDirectorId)}. Called by ${calledBy} on ${ukMeetingTime(meeting.calledAt)}.`,
		`Directors on it: ${onIt.join(', ')}.`,
		`How its decisions carry: ${decisionRuleSentence(ruleInForce)}`
	];
}
