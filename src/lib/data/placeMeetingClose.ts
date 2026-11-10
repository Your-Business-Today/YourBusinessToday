import { meetingStage, meetingStages, standingAgenda, type AgendaItem } from './boardroomMeeting';
import { isSitting, type BoardroomDirector } from './boardroomDirector';
import { seatInRoom } from './boardroomRoomTurns';
import { emptyMeetingRoom, outcomeOfItem } from './boardroomRoom';
import { decisionOnItem } from './boardDecisionOnItem';
import { boardMinutesRefusals } from './boardroomMinutesRules';
import type { MeetingRecord } from './describeBoardroomMeeting';
import type { RoomCaller } from './placeBoardContribution';

/** An item still waiting when the meeting is closed: by its number, and who a decision on it still waits for. */
export type WaitingItem = { number: number; title: string; isInTheRoom: boolean; waitingFor: string[] };

/** Where a close goes: the closing director's seat, and every item still waiting. */
export type ClosePlace = { seatId: string; waiting: WaitingItem[] };

function isChairSitting(record: MeetingRecord): boolean {
	const { directors, meeting } = record;
	const chair = directors.find((director) => director.id === meeting.chairDirectorId);
	return chair !== undefined && isSitting(chair);
}

/**
 * The minute-taker: the caller's own seat when they chair the meeting, or, when the chair no longer sits, when they
 * are a sitting director who was on it. Null for anyone else.
 */
export function minuteTakerSeat(record: MeetingRecord, accountId: string, now: Date): BoardroomDirector | null {
	const seat = seatInRoom(record, accountId, now);
	if (seat === null) return null;
	const { meeting } = record;
	const isChair = seat.id === meeting.chairDirectorId;
	return isChair || !isChairSitting(record) ? seat : null;
}

function waitingItem(record: MeetingRecord, item: AgendaItem, index: number, now: Date): WaitingItem | null {
	const isInTheRoom = outcomeOfItem(record.room ?? emptyMeetingRoom, item.id) === null;
	const decision = decisionOnItem(record, item, now);
	const waitingFor = decision === null ? [] : decision.waitingFor;
	if (!isInTheRoom && waitingFor.length === 0) return null;
	return { number: index + 1, title: item.title, isInTheRoom, waitingFor };
}

/** Every item that has not come out of the room, or whose decision still waits for a director's answer. */
export function itemsWaitingAt(record: MeetingRecord, now: Date): WaitingItem[] {
	const waiting = standingAgenda(record.items).map((item, index) => waitingItem(record, item, index, now));
	return waiting.filter((item): item is WaitingItem => item !== null);
}

/** Where the minute-taker's close of an open meeting goes, with what is still waiting, or why it cannot be closed. */
export function placeMeetingClose(record: MeetingRecord, caller: RoomCaller): ClosePlace | string {
	if (meetingStage(record.meeting, caller.now) !== meetingStages.open) return boardMinutesRefusals.meetingNotOpen;
	const seat = minuteTakerSeat(record, caller.accountId, caller.now);
	if (seat === null) return boardMinutesRefusals.notTheMinuteTaker;
	return { seatId: seat.id, waiting: itemsWaitingAt(record, caller.now) };
}
