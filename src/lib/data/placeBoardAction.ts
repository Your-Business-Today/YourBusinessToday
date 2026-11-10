import { meetingStage, meetingStages, standingAgenda, type AgendaItem } from './boardroomMeeting';
import { seatInRoom } from './boardroomRoomTurns';
import { emptyMeetingRoom, outcomeKinds, outcomeOfItem } from './boardroomRoom';
import { answersTo, decisionOfItem, noMeetingDecisions } from './boardroomDecision';
import { boardActionRefusals } from './boardroomActionRules';
import type { MeetingRecord } from './describeBoardroomMeeting';
import type { RoomCaller } from './placeBoardContribution';

const decisionPurpose = 'decision';

/** Where an action goes: the item for decision it is agreed on, and the recording director's own seat. */
export type BoardActionPlace = { item: AgendaItem; itemNumber: number; seatId: string };

function isDecisionAnswered(record: MeetingRecord, item: AgendaItem): boolean {
	const meetingDecisions = record.decisions ?? noMeetingDecisions;
	const decision = decisionOfItem(meetingDecisions, item.id);
	return decision !== null && answersTo(meetingDecisions, decision.id).length > 0;
}

function isNotAgreed(record: MeetingRecord, item: AgendaItem): boolean {
	const outcome = outcomeOfItem(record.room ?? emptyMeetingRoom, item.id);
	return outcome?.outcome === outcomeKinds.notAgreed;
}

/** Why no action can be recorded on an item now, or null when one can: an open meeting, an item for decision still unanswered. */
export function itemActionRefusal(record: MeetingRecord, item: AgendaItem, now: Date): string | null {
	if (meetingStage(record.meeting, now) !== meetingStages.open) return boardActionRefusals.meetingNotOpen;
	if (item.purpose !== decisionPurpose) return boardActionRefusals.itemNotForDecision;
	if (isNotAgreed(record, item)) return boardActionRefusals.itemNotAgreed;
	if (isDecisionAnswered(record, item)) return boardActionRefusals.decisionAlreadyAnswered;
	return null;
}

/**
 * Where a director's action on an item goes, or why it cannot be recorded: only while the meeting is open, only on
 * an item for decision that has not come out not agreed, only before the first answer to its decision, and only
 * from a sitting director who was on the meeting.
 */
export function placeBoardAction(record: MeetingRecord, itemNumber: number, caller: RoomCaller): BoardActionPlace | string {
	const item = standingAgenda(record.items)[itemNumber - 1];
	if (item === undefined) return boardActionRefusals.itemNotOnAgenda;
	const refusal = itemActionRefusal(record, item, caller.now);
	if (refusal !== null) return refusal;
	const seat = seatInRoom(record, caller.accountId, caller.now);
	if (seat === null) return boardActionRefusals.callerHasNoSeat;
	return { item, itemNumber, seatId: seat.id };
}
