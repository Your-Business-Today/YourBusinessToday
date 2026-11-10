import { meetingStage, meetingStages, standingAgenda, type AgendaItem } from './boardroomMeeting';
import { seatInRoom } from './boardroomRoomTurns';
import { boardDecisionRefusals } from './boardroomDecisionRules';
import { decisionOnItem, type DecisionOnItem } from './boardDecisionOnItem';
import type { DecisionAnswerDraft } from './validateDecisionAnswer';
import type { MeetingRecord } from './describeBoardroomMeeting';
import type { RoomCaller } from './placeBoardContribution';

/** Where a director's answer goes: the item, the decision on it as it stands, and the director's own seat. */
export type DecisionAnswerPlace = { item: AgendaItem; itemNumber: number; onItem: DecisionOnItem; seatId: string };

/**
 * Where the signed-in director's own answer to the decision on an item goes, or why it cannot be given: only
 * while the meeting is open, only from their own seat on it, and once. The seat is found from their account
 * alone, so nobody answers for another director.
 */
export function placeDecisionAnswer(record: MeetingRecord, draft: DecisionAnswerDraft, caller: RoomCaller): DecisionAnswerPlace | string {
	if (meetingStage(record.meeting, caller.now) !== meetingStages.open) return boardDecisionRefusals.meetingNotOpen;
	const item = standingAgenda(record.items)[draft.itemNumber - 1];
	if (item === undefined) return boardDecisionRefusals.itemNotOnAgenda;
	const onItem = decisionOnItem(record, item, caller.now);
	if (onItem === null) return boardDecisionRefusals.noDecisionOnItem;
	const seat = seatInRoom(record, caller.accountId, caller.now);
	if (seat === null) return boardDecisionRefusals.callerHasNoSeat;
	const hasAnswered = onItem.answers.some((answer) => answer.directorId === seat.id);
	if (hasAnswered) return boardDecisionRefusals.alreadyAnswered;
	return { item, itemNumber: draft.itemNumber, onItem, seatId: seat.id };
}
