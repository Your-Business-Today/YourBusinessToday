import { beforeEach, describe, expect, it, vi } from 'vitest';
import { callDirectorsToTheirTurns } from './callDirectorsToTheirTurns';
import { meetingInRoom, said } from '$lib/data/boardroomRoom.fixtures';
import { controlsOf, settingChange } from '$lib/data/boardroomSeatControls.fixtures';
import { duringTheMeeting, meetingId, yourBusinessToday } from '$lib/data/boardroomMeeting.fixtures';
import type { BoardContribution } from '$lib/data/boardroomRoom';
import type { DirectorTurn } from '$lib/data/boardroomTurnCalls';

const board = vi.hoisted(() => ({
	said: [] as BoardContribution[],
	pausedSeatIds: [] as string[],
	calledBefore: new Set<string>(),
	emails: [] as { to: string; subject: string; html: string }[]
}));
vi.mock('./readBoardroomMeeting', () => ({ getMeetingRecord: async () => meetingInRoom({ contributions: board.said }) }));
vi.mock('./getBoardroomSeatControls', () => ({
	getControlsOfSeat: async (_supabase: unknown, _meetingId: string, seatId: string) =>
		controlsOf(seatId, { settingChanges: board.pausedSeatIds.includes(seatId) ? [settingChange('paused', true, 1)] : [] })
}));
vi.mock('./saveBoardroomTurnCalls', () => ({
	insertNewTurnCalls: async (_supabase: unknown, _meeting: unknown, turns: DirectorTurn[]) => {
		const keyOf = (turn: DirectorTurn) => `${turn.itemNumber} ${turn.seatId} ${turn.round}`;
		const fresh = turns.filter((turn) => !board.calledBefore.has(keyOf(turn)));
		fresh.forEach((turn) => board.calledBefore.add(keyOf(turn)));
		return fresh;
	}
}));
vi.mock('$lib/server/accounts/getAccountsById', () => ({
	getAccountsById: async (_supabase: unknown, ids: string[]) => ids.map((id) => ({ id, name: id, email: `${id}@example.com` }))
}));
vi.mock('$lib/server/email/sendTransactionalEmail', () => ({
	sendTransactionalEmail: async (email: { to: string; subject: string; html: string }) => board.emails.push(email) && 'sent'
}));

const callTurns = () => callDirectorsToTheirTurns({} as never, yourBusinessToday, meetingId, duringTheMeeting);
const recipients = () => board.emails.map((email) => email.to);

describe('directors are emailed when it is their turn in a board meeting', () => {
	beforeEach(() => {
		board.said = [];
		board.pausedSeatIds = [];
		board.calledBefore = new Set();
		board.emails = [];
	});

	it('emails each director once when the room opens, naming the organisation, the meeting, each item and round, and the page', async () => {
		await callTurns();
		expect(recipients()).toEqual(['nigel@example.com', 'jeremy@example.com']);
		const [email] = board.emails;
		expect(email.subject).toBe('Your turn in the Your Business Today board meeting');
		expect(email.html).toContain('12 Nov 2026 at 10:00');
		expect(email.html).toContain('Item 1, Item 1: round 1 of 3<br />Item 2, Item 2: round 1 of 3');
		expect(email.html).toContain(`https://yourbusiness.today/organisations/ybt/boardroom/${meetingId}`);
	});

	it('never emails the same turn twice', async () => {
		await callTurns();
		await callTurns();
		expect(board.emails).toHaveLength(2);
	});

	it('emails everyone again when the director before them closes a round', async () => {
		await callTurns();
		board.emails = [];
		board.said = [said('nigels-seat', 1, 'comments')];
		await callTurns();
		expect(board.emails).toEqual([]);
		board.said.push(said('jeremys-seat', 1, 'comments'));
		await callTurns();
		expect(recipients()).toEqual(['nigel@example.com', 'jeremy@example.com']);
		expect(board.emails[0].html).toContain('Item 1, Item 1: round 2 of 3');
	});

	it('emails nobody who has paused their own Claude, and calls them once they let it go again', async () => {
		board.pausedSeatIds = ['jeremys-seat'];
		await callTurns();
		expect(recipients()).toEqual(['nigel@example.com']);
		board.pausedSeatIds = [];
		await callTurns();
		expect(recipients()).toEqual(['nigel@example.com', 'jeremy@example.com']);
	});
});
