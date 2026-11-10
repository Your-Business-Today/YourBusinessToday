import { beforeEach, describe, expect, it, vi } from 'vitest';
import { openBoardroomRoom } from './openBoardroomRoom';
import { boardRoomRefusals } from '$lib/data/boardroomRoomRules';
import { meetingInRoom } from '$lib/data/boardroomRoom.fixtures';
import { calledMeeting, dayBeforeTheMeeting, duringTheMeeting, meetingId, yourBusinessToday } from '$lib/data/boardroomMeeting.fixtures';
import type { MeetingRecord } from '$lib/data/describeBoardroomMeeting';

const board = vi.hoisted(() => ({ record: null as MeetingRecord | null, opened: [] as Record<string, unknown>[] }));
vi.mock('./readBoardroomMeeting', () => ({ getMeetingRecord: async () => board.record }));
vi.mock('./getBoardroomRoom', () => ({ getRoomOfMeeting: async () => ({ room: null, contributions: [], outcomes: [] }) }));
vi.mock('./saveBoardroomRoom', () => ({ insertBoardroomRoom: async (_supabase: unknown, opening: Record<string, unknown>) => board.opened.push(opening) > 0 }));

function open(accountId: string, now = duringTheMeeting) {
	return openBoardroomRoom({} as never, yourBusinessToday, meetingId, 4, { accountId, now });
}

describe('a director opens the room of a meeting', () => {
	beforeEach(() => {
		board.record = { ...meetingInRoom({ room: null }), meeting: calledMeeting };
		board.opened = [];
	});

	it('opens it from the meeting’s time under the caller’s own seat, with the rounds they give', async () => {
		expect(await open('jeremy')).toContain('The room is open, and the meeting with it. Each item is talked through in at most 4 rounds');
		expect(board.opened).toEqual([{ meeting: calledMeeting, seatId: 'jeremys-seat', openedBy: 'jeremy', roundsLimit: 4 }]);
	});

	it('refuses before the meeting’s time, once it has closed, and anyone not on it', async () => {
		expect(await open('jeremy', dayBeforeTheMeeting)).toBe(boardRoomRefusals.meetingNotYetTime);
		expect(await open('staff')).toBe(boardRoomRefusals.callerNotOnMeeting);
		board.record = { ...board.record!, meeting: { ...calledMeeting, closedAt: '2026-11-12T11:00:00Z' } };
		expect(await open('jeremy')).toBe(boardRoomRefusals.meetingHasClosed);
		expect(board.opened).toEqual([]);
	});

	it('opens a room once: a second opening says it is already open and changes nothing', async () => {
		board.record = meetingInRoom();
		expect(await open('nigel')).toContain('The room was already open. Each item is talked through in at most 3 rounds');
		expect(board.opened).toEqual([]);
	});
});
