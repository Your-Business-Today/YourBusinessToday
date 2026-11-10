import { nameOfSeat, type AgendaItem } from './boardroomMeeting';
import { emptyMeetingRoom, outcomeKinds, outcomeOfItem, type ItemOutcome } from './boardroomRoom';
import { currentProposal, currentRound, itemTalkOf, latestOfSeat, seatsYetToSpeak, type ItemTalk } from './boardroomRoomTurns';
import { numberOf } from './describeBoardContribution';
import type { BoardroomDirector } from './boardroomDirector';
import type { MeetingRecord } from './describeBoardroomMeeting';

const roomIndent = '   ';
const goesToTheDirectorsAs = { decision: 'a proposed decision', noting: 'what the board proposes to note' } as const;

function namesOf(directors: BoardroomDirector[], seatIds: string[]): string {
	return seatIds.map((seatId) => nameOfSeat(directors, seatId)).join(', ');
}

function onTheTable(talk: ItemTalk): string {
	const proposal = currentProposal(talk);
	if (proposal === null) return 'Nothing proposed yet.';
	return `Wording on the table: "${proposal.wording}" (contribution ${numberOf(talk.contributions, proposal.id)}).`;
}

/** Where an item stands while it is talked through: the round, the wording on the table, and who is still to speak. */
export function talkingLine(talk: ItemTalk, directors: BoardroomDirector[]): string {
	const round = `Round ${currentRound(talk)} of ${talk.roundsLimit}.`;
	return `${round} ${onTheTable(talk)} Still to speak this round: ${namesOf(directors, seatsYetToSpeak(talk))}.`;
}

/** How an item came out of the room, in one line. */
export function outcomeLine(outcome: ItemOutcome, item: AgendaItem): string {
	const rounds = `in round ${outcome.roundsTaken}`;
	if (outcome.outcome === outcomeKinds.notAgreed) return `Came out not agreed ${rounds}; it goes to the directors with each position set out.`;
	return `Came out agreed ${rounds}; it goes to the directors as ${goesToTheDirectorsAs[item.purpose]}: "${outcome.wording}".`;
}

function positionLine(talk: ItemTalk, seatId: string, directors: BoardroomDirector[]): string {
	const latest = latestOfSeat(talk, seatId);
	const name = nameOfSeat(directors, seatId);
	if (latest === null) return `- ${name}: said nothing.`;
	const wording = latest.wording === null ? '' : ` "${latest.wording}"`;
	return `- ${name}: ${latest.stance}${wording}. ${latest.words}`;
}

/** Each director's position as their Claude last put it, set out when an item comes out not agreed. */
export function positionLines(talk: ItemTalk, directors: BoardroomDirector[]): string[] {
	return ['Each director’s position, as their Claude last put it:', ...talk.seatIds.map((seatId) => positionLine(talk, seatId, directors))];
}

/** Beneath an item on read_board_meeting: where it stands in the room, once the room is open. */
export function roomLinesOnAgenda(record: MeetingRecord, item: AgendaItem, now: Date): string[] {
	const talk = itemTalkOf(record, item, now);
	if (talk.roundsLimit === 0) return [];
	const outcome = outcomeOfItem(record.room ?? emptyMeetingRoom, item.id);
	if (outcome !== null) return [`${roomIndent}- ${outcomeLine(outcome, item)}`];
	return [`${roomIndent}- In the room: ${talkingLine(talk, record.directors)}`];
}

/** The answer when a director's Claude opens the room, or finds it already open. */
export function roomOpenedWords(roundsLimit: number, isNewlyOpened: boolean): string {
	const opened = isNewlyOpened ? 'The room is open, and the meeting with it.' : 'The room was already open.';
	return (
		`${opened} Each item is talked through in at most ${roundsLimit} rounds, every director's Claude speaking once a round. ` +
		'Read an item with read_board_item, and speak for your own director with speak_on_board_item.'
	);
}
