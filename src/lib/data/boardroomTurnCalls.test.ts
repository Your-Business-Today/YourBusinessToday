import { describe, expect, it } from 'vitest';
import { meetingInRoom, said } from './boardroomRoom.fixtures';
import { duringTheMeeting } from './boardroomMeeting.fixtures';
import { seatsWithTurns, turnLine, turnsOfSeat, turnsOpenInRoom } from './boardroomTurnCalls';

const placesOf = (record: ReturnType<typeof meetingInRoom>) =>
	turnsOpenInRoom(record, duringTheMeeting).map((turn) => `${turn.item.id} ${turn.seatId} round ${turn.round}`);

describe('the turns open in a board meeting room', () => {
	it('gives every director a first-round turn on every item the moment the room opens', () => {
		expect(placesOf(meetingInRoom())).toEqual([
			'item-1 nigels-seat round 1',
			'item-1 jeremys-seat round 1',
			'item-2 nigels-seat round 1',
			'item-2 jeremys-seat round 1'
		]);
	});

	it('takes a director off an item once they have spoken in the round', () => {
		const record = meetingInRoom({ contributions: [said('nigels-seat', 1, 'comments')] });
		expect(placesOf(record)).toContain('item-1 jeremys-seat round 1');
		expect(placesOf(record)).not.toContain('item-1 nigels-seat round 1');
	});

	it('opens the next round for everyone once the last director in the round has spoken', () => {
		const record = meetingInRoom({ contributions: [said('nigels-seat', 1, 'comments'), said('jeremys-seat', 1, 'comments')] });
		expect(placesOf(record).filter((place) => place.startsWith('item-1'))).toEqual([
			'item-1 nigels-seat round 2',
			'item-1 jeremys-seat round 2'
		]);
	});

	it('gives no turn on an item that has come out of the room', () => {
		const outcome = { agendaItemId: 'item-1', outcome: 'agreed' as const, proposalId: null, wording: 'Yes.', roundsTaken: 1, reachedAt: '2026-11-12T10:10:00Z' };
		const record = meetingInRoom({ outcomes: [outcome] });
		expect(placesOf(record).every((place) => place.startsWith('item-2'))).toBe(true);
	});

	it('gives no turn before the room opens or after the meeting closes', () => {
		const record = meetingInRoom();
		expect(placesOf({ ...record, room: undefined })).toEqual([]);
		const closedMeeting = { ...record.meeting, closedAt: '2026-11-12T10:20:00Z' };
		expect(placesOf({ ...record, meeting: closedMeeting })).toEqual([]);
	});

	it('groups the turns by seat and lists each one by item and round', () => {
		const turns = turnsOpenInRoom(meetingInRoom(), duringTheMeeting);
		expect(seatsWithTurns(turns)).toEqual(['nigels-seat', 'jeremys-seat']);
		expect(turnsOfSeat(turns, 'jeremys-seat').map(turnLine)).toEqual(['Item 1, Item 1: round 1 of 3', 'Item 2, Item 2: round 1 of 3']);
	});
});
