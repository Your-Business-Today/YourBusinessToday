import { agendaItem, calledMeeting, jeremysSeat, nigelsSeat } from './boardroomMeeting.fixtures';
import type { BoardContribution, ContributionStance, MeetingRoom } from './boardroomRoom';
import type { MeetingRecord } from './describeBoardroomMeeting';

/** The room of the meeting in boardroomMeeting.fixtures, opened by Nigel at its time with three rounds an item. */
export const openRoom = {
	meetingId: calledMeeting.id,
	roundsLimit: 3,
	openedByDirectorId: 'nigels-seat',
	openedAt: '2026-11-12T10:00:00.000Z'
};

let minute = 0;

/** One contribution on item 1, said a minute after the one before. */
export function said(
	directorId: string,
	round: number,
	stance: ContributionStance,
	extra: Partial<BoardContribution> = {}
): BoardContribution {
	minute += 1;
	const at = new Date(Date.UTC(2026, 10, 12, 10, minute)).toISOString();
	const wording = stance === 'proposes' ? 'Approve the accounts.' : null;
	const base = { agendaItemId: 'item-1', directorId, round, stance, words: `${directorId} speaks`, wording };
	return { id: `said-${minute}`, onProposalId: null, correctsId: null, createdAt: at, ...base, ...extra };
}

/** The meeting open, both seats on it, two items on its agenda, and whatever has been said in its room. */
export function meetingInRoom(room: Partial<MeetingRoom> = {}): MeetingRecord {
	const meetingRoom = { room: openRoom, contributions: [], outcomes: [], ...room };
	const meeting = { ...calledMeeting, openedAt: openRoom.openedAt };
	return { meeting, directors: [nigelsSeat, jeremysSeat], items: [agendaItem(1), agendaItem(2)], papers: [], recordPapers: [], room: meetingRoom };
}
