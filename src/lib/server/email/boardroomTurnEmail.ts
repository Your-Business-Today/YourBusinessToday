import { escapeHtml } from '$lib/data/escapeHtml';
import { ukMeetingTime } from '$lib/data/ukMeetingTime';
import { turnLine, type DirectorTurn } from '$lib/data/boardroomTurnCalls';
import { renderInviteEmail } from './inviteEmailShell';

/** A director called to their turns in one meeting: whose board, when it meets, the turns open to them, and its page. */
export type BoardroomTurnCall = { organisationName: string; meetsAt: string; turns: DirectorTurn[]; meetingUrl: string };

export function boardroomTurnSubject(call: BoardroomTurnCall): string {
	return `Your turn in the ${call.organisationName} board meeting`;
}

function turnListHtml(turns: DirectorTurn[]): string {
	return turns.map((turn) => escapeHtml(turnLine(turn))).join('<br />');
}

/** Tells a director it is their turn on one or more items, so they ask their Claude to take it. */
export function renderBoardroomTurnEmail(call: BoardroomTurnCall): string {
	const heading = escapeHtml(boardroomTurnSubject(call));
	const meeting = `the board meeting of ${ukMeetingTime(call.meetsAt)}`;
	const body =
		`It is your turn to speak in ${meeting} on:<br /><br />${turnListHtml(call.turns)}<br /><br />` +
		'Ask your Claude to take your turn, or open the meeting to steer it first.';
	return renderInviteEmail(heading, body, call.meetingUrl, 'Open the meeting');
}
