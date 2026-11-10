import { beforeEach, describe, expect, it, vi } from 'vitest';
import { changeOwnClaudeSetting, steerOwnClaude } from './steerOwnClaude';
import { seatControlRefusals } from '$lib/data/boardroomSeatControlRules';
import { meetingInRoom } from '$lib/data/boardroomRoom.fixtures';
import { duringTheMeeting, meetingId, yourBusinessToday } from '$lib/data/boardroomMeeting.fixtures';

const kept = vi.hoisted(() => ({ notes: [] as Record<string, unknown>[], settings: [] as Record<string, unknown>[], hasClosed: false }));
vi.mock('./readBoardroomMeeting', () => ({
	getMeetingRecord: async () => {
		const record = meetingInRoom();
		const closedAt = kept.hasClosed ? '2026-11-12T10:10:00.000Z' : null;
		return { ...record, meeting: { ...record.meeting, closedAt } };
	}
}));
vi.mock('./saveBoardroomSeatControls', () => ({
	insertSteerNote: async (_supabase: unknown, placing: Record<string, unknown>, words: string) => kept.notes.push({ ...placing, words }),
	insertSeatSetting: async (_supabase: unknown, placing: Record<string, unknown>, change: Record<string, unknown>) =>
		kept.settings.push({ ...placing, ...change })
}));

const asJeremy = { accountId: 'jeremy', now: duringTheMeeting };
const pause = { setting: 'paused', isOn: true } as const;

describe('a director steers and pauses only their own Claude', () => {
	beforeEach(() => {
		kept.notes = [];
		kept.settings = [];
		kept.hasClosed = false;
	});

	it('keeps a note under the writer’s own seat, found from their account alone', async () => {
		const answer = await steerOwnClaude({} as never, yourBusinessToday, meetingId, 'Hold firm on the date.', asJeremy);
		expect(answer.isKept).toBe(true);
		expect(kept.notes).toEqual([expect.objectContaining({ seatId: 'jeremys-seat', givenBy: 'jeremy', words: 'Hold firm on the date.' })]);
	});

	it('pauses the changer’s own Claude, and nobody else’s', async () => {
		await changeOwnClaudeSetting({} as never, yourBusinessToday, meetingId, pause, asJeremy);
		expect(kept.settings).toEqual([expect.objectContaining({ seatId: 'jeremys-seat', givenBy: 'jeremy', setting: 'paused', isOn: true })]);
		expect(kept.settings.some((setting) => setting.seatId === 'nigels-seat')).toBe(false);
	});

	it('refuses someone with no seat on the meeting, and keeps nothing', async () => {
		const outsider = { accountId: 'an-administrator', now: duringTheMeeting };
		expect((await steerOwnClaude({} as never, yourBusinessToday, meetingId, 'Agree.', outsider)).answer).toBe(seatControlRefusals.callerHasNoSeat);
		expect((await changeOwnClaudeSetting({} as never, yourBusinessToday, meetingId, pause, outsider)).isKept).toBe(false);
		expect([...kept.notes, ...kept.settings]).toEqual([]);
	});

	it('changes nothing once the meeting has closed', async () => {
		kept.hasClosed = true;
		expect((await steerOwnClaude({} as never, yourBusinessToday, meetingId, 'Agree.', asJeremy)).answer).toBe(seatControlRefusals.meetingHasClosed);
	});
});
