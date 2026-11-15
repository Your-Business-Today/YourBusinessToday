import { meetingStage, meetingStages, standingAgenda, type AgendaItem } from './boardroomMeeting';
import { emptyMeetingRoom, openRoomOf, outcomeOfItem } from './boardroomRoom';
import { currentRound, itemTalkOf, seatsYetToSpeak } from './boardroomRoomTurns';
import type { MeetingRecord } from './describeBoardroomMeeting';

/** One director's turn on one agenda item: the seat still to speak in the round under way, and that round. */
export type DirectorTurn = {
	item: AgendaItem;
	itemNumber: number;
	seatId: string;
	round: number;
	roundsLimit: number;
};

function turnsOnItem(record: MeetingRecord, item: AgendaItem, itemNumber: number, now: Date): DirectorTurn[] {
	const meetingRoom = record.room ?? emptyMeetingRoom;
	const outcome = outcomeOfItem(meetingRoom, item.id);
	if (outcome !== null) return [];
	const talk = itemTalkOf(record, item, now);
	const round = currentRound(talk);
	const { roundsLimit } = talk;
	if (round > roundsLimit) return [];
	return seatsYetToSpeak(talk).map((seatId) => ({ item, itemNumber, seatId, round, roundsLimit }));
}

/** Every turn open in a meeting's room now: each seat still to speak, on each item still being talked through. */
export function turnsOpenInRoom(record: MeetingRecord, now: Date): DirectorTurn[] {
	const openRoom = openRoomOf(record.room);
	if (openRoom === null) return [];
	const stage = meetingStage(record.meeting, now);
	if (stage === meetingStages.closed) return [];
	const agenda = standingAgenda(record.items);
	return agenda.flatMap((item, index) => turnsOnItem(record, item, index + 1, now));
}

/** The turns of one seat, out of all of them. */
export function turnsOfSeat(turns: DirectorTurn[], seatId: string): DirectorTurn[] {
	return turns.filter((turn) => turn.seatId === seatId);
}

/** The seats with at least one turn, each once. */
export function seatsWithTurns(turns: DirectorTurn[]): string[] {
	return [...new Set(turns.map((turn) => turn.seatId))];
}

/** One turn as an email lists it: "Item 2, Approve the accounts: round 1 of 3". */
export function turnLine(turn: DirectorTurn): string {
	const { item } = turn;
	return `Item ${turn.itemNumber}, ${item.title}: round ${turn.round} of ${turn.roundsLimit}`;
}
