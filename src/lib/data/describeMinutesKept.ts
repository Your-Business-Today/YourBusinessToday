import { nameOfSeat } from './boardroomMeeting';
import { minutesStandingWords } from './describeMinutesStanding';
import type { BoardroomDirector } from './boardroomDirector';
import type { WaitingItem } from './placeMeetingClose';
import type { MinutesApproval } from './minutesApproval';

function waitingLine(item: WaitingItem, directors: BoardroomDirector[]): string {
	if (item.isInTheRoom) return `Item ${item.number}, ${item.title}: still in the room, so it would be minuted as not concluded.`;
	const names = item.waitingFor.map((seatId) => nameOfSeat(directors, seatId)).join(', ');
	return `Item ${item.number}, ${item.title}: its decision still waits for ${names}, and would be settled from the answers given.`;
}

/** What still waits when the minute-taker would close the meeting, one line an item: the page and the connector say the same. */
export function closeWaitingLines(waiting: WaitingItem[], directors: BoardroomDirector[]): string[] {
	return waiting.map((item) => waitingLine(item, directors));
}

/** What is still waiting, when the chair has not said to close with it waiting: nothing is closed. */
export function closeWaitsForWordWords(waiting: WaitingItem[], directors: BoardroomDirector[]): string {
	return [
		'Not closed. Closing cannot be undone, and once closed no director answers a decision and nothing more is said in the room. Still waiting:',
		...closeWaitingLines(waiting, directors).map((line) => `- ${line}`),
		'If the chair tells you to close with these waiting, call close_board_meeting again with closeWithItemsWaiting true. ' +
			'A director who gave no answer is then recorded as giving none.'
	].join('\n');
}

export const meetingClosedWords =
	'The meeting is closed, and when it closed is kept. Each decision is settled from the answers given. ' +
	'Now write the minutes: read the record with read_board_minutes, write them from it alone, read them to the chair, ' +
	'and keep them with write_board_minutes.';

/** The answer when a version of the minutes is kept. */
export function minutesVersionKeptWords(version: number): string {
	return (
		`Kept as version ${version} of the minutes, with the facts of the record put in by the service as they stand now. ` +
		'Every earlier version is kept. Each director who was on the meeting now approves this version or asks for a change, ' +
		'themselves, on the meeting page or through their own Claude.'
	);
}

/** The answer when a director's own answer to the minutes is kept: what it was, and where the minutes stand now. */
export function minutesAnswerKeptWords(version: number, approval: MinutesApproval, directors: BoardroomDirector[]): string {
	const kept = `Your answer to version ${version} of the minutes is kept as you gave it; it is not changed.`;
	return `${kept} ${minutesStandingWords(approval, directors)}`;
}
