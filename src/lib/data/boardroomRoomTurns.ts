import { directorsOnMeeting, type AgendaItem } from './boardroomMeeting';
import { isSitting, sittingSeatOf, type BoardroomDirector } from './boardroomDirector';
import { contributionsOnItem, openRoomOf, stances, type BoardContribution } from './boardroomRoom';
import type { MeetingRecord } from './describeBoardroomMeeting';

/** One item as the room talks it through: what was said on it, the seats speaking, and the most rounds it has. */
export type ItemTalk = {
	contributions: BoardContribution[];
	seatIds: string[];
	roundsLimit: number;
};

/** The talk on one item: the seats are the directors on the meeting who still sit, so a stood-down seat blocks nobody. */
export function itemTalkOf(record: MeetingRecord, item: AgendaItem, now: Date): ItemTalk {
	const onIt = directorsOnMeeting(record.directors, record.meeting, now).filter(isSitting);
	const meetingRoom = record.room;
	const contributions = meetingRoom === undefined ? [] : contributionsOnItem(meetingRoom, item.id);
	const openRoom = openRoomOf(meetingRoom);
	const roundsLimit = openRoom === null ? 0 : openRoom.roundsLimit;
	return { contributions, seatIds: onIt.map((director) => director.id), roundsLimit };
}

/** How many turns a seat has taken on the item; a correction is said within a turn, not as one. */
export function turnsOf(talk: ItemTalk, seatId: string): number {
	return talk.contributions.filter((contribution) => contribution.directorId === seatId && contribution.correctsId === null).length;
}

/** The rounds every seat on the item has finished. */
export function roundsCompleted(talk: ItemTalk): number {
	const { seatIds } = talk;
	if (seatIds.length === 0) return 0;
	return Math.min(...seatIds.map((seatId) => turnsOf(talk, seatId)));
}

export function currentRound(talk: ItemTalk): number {
	return roundsCompleted(talk) + 1;
}

/** The seats still to speak in the round under way. */
export function seatsYetToSpeak(talk: ItemTalk): string[] {
	const round = currentRound(talk);
	return talk.seatIds.filter((seatId) => turnsOf(talk, seatId) < round);
}

export function isStillToSpeak(talk: ItemTalk, seatId: string): boolean {
	const stillToSpeak = seatsYetToSpeak(talk);
	return stillToSpeak.includes(seatId);
}

export function latestOfSeat(talk: ItemTalk, seatId: string): BoardContribution | null {
	const own = talk.contributions.filter((contribution) => contribution.directorId === seatId);
	return own.at(-1) ?? null;
}

/** The wording on the table: the latest proposed on the item, or null while nothing is proposed. */
export function currentProposal(talk: ItemTalk): BoardContribution | null {
	const proposals = talk.contributions.filter((contribution) => contribution.stance === stances.proposes);
	return proposals.at(-1) ?? null;
}

/** The caller's own seat in the room: they sit on the board now and are on the meeting, or null. */
export function seatInRoom(record: MeetingRecord, accountId: string, now: Date): BoardroomDirector | null {
	const seat = sittingSeatOf(record.directors, accountId);
	if (seat === null) return null;
	const onIt = directorsOnMeeting(record.directors, record.meeting, now);
	return onIt.some((director) => director.id === seat.id) ? seat : null;
}
