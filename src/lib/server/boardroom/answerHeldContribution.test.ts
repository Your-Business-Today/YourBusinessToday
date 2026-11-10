import { beforeEach, describe, expect, it, vi } from 'vitest';
import { answerHeldContribution } from './answerHeldContribution';
import { seatControlRefusals } from '$lib/data/boardroomSeatControlRules';
import { meetingInRoom, said } from '$lib/data/boardroomRoom.fixtures';
import { controlsOf, heldPiece, settingChange } from '$lib/data/boardroomSeatControls.fixtures';
import { duringTheMeeting, meetingId, yourBusinessToday } from '$lib/data/boardroomMeeting.fixtures';
import type { BoardContribution } from '$lib/data/boardroomRoom';
import type { SeatControls } from '$lib/data/boardroomSeatControls';

const room = vi.hoisted(() => ({
	said: [] as BoardContribution[],
	controlsBySeat: {} as Record<string, SeatControls>,
	answers: [] as Record<string, unknown>[]
}));
vi.mock('./readBoardroomMeeting', () => ({ getMeetingRecord: async () => meetingInRoom({ contributions: room.said }) }));
vi.mock('./getBoardroomSeatControls', () => ({
	getControlsOfSeat: async (_supabase: unknown, _meetingId: string, seatId: string) => room.controlsBySeat[seatId] ?? controlsOf(seatId)
}));
vi.mock('./saveBoardroomRoom', () => ({
	insertBoardContribution: async (_supabase: unknown, placing: Record<string, unknown>) => {
		const kept = said(placing.seatId as string, placing.round as number, placing.stance as never);
		room.said.push(kept);
		return kept.id;
	},
	insertItemOutcome: async () => undefined
}));
vi.mock('./saveBoardroomSeatControls', () => ({
	insertHeldAnswer: async (_supabase: unknown, placing: Record<string, unknown>, answer: Record<string, unknown>) =>
		room.answers.push({ seatId: placing.seatId, givenBy: placing.givenBy, ...answer })
}));

const jeremysHeld = heldPiece();

function answerAs(accountId: string, isYes: boolean) {
	const draft = { heldId: jeremysHeld.id, isYes };
	return answerHeldContribution({} as never, yourBusinessToday, meetingId, draft, { accountId, now: duringTheMeeting });
}

describe('a director answers a piece their own Claude holds for them', () => {
	beforeEach(() => {
		room.said = [said('nigels-seat', 1, 'proposes')];
		room.controlsBySeat = { 'jeremys-seat': controlsOf('jeremys-seat', { held: [jeremysHeld] }) };
		room.answers = [];
	});

	it('says it in the room on their yes, in their own seat’s turn, and keeps the answer with what it became', async () => {
		const answered = await answerAs('jeremy', true);
		expect(answered.isKept).toBe(true);
		expect(answered.answer).toContain('Kept as contribution 2 on item 1, in round 1.');
		const kept = room.said.at(-1);
		expect(kept?.directorId).toBe('jeremys-seat');
		expect(room.answers).toEqual([{ seatId: 'jeremys-seat', givenBy: 'jeremy', heldId: jeremysHeld.id, answer: 'said', contributionId: kept?.id }]);
	});

	it('keeps it unsaid on their no, and says nothing in the room', async () => {
		const answered = await answerAs('jeremy', false);
		expect(answered.isKept).toBe(true);
		expect(room.said).toHaveLength(1);
		expect(room.answers[0]).toMatchObject({ answer: 'kept_unsaid', contributionId: null });
	});

	it('never lets another director answer for Jeremy’s Claude', async () => {
		const answered = await answerAs('nigel', true);
		expect(answered).toEqual({ answer: seatControlRefusals.noSuchHeldPiece, isKept: false });
		expect(room.said).toHaveLength(1);
		expect(room.answers).toEqual([]);
	});

	it('says nothing on a yes while the director has their Claude paused', async () => {
		const paused = [settingChange('paused', true, 1)];
		room.controlsBySeat = { 'jeremys-seat': controlsOf('jeremys-seat', { held: [jeremysHeld], settingChanges: paused }) };
		expect((await answerAs('jeremy', true)).answer).toBe(seatControlRefusals.claudeIsPaused);
		expect(room.said).toHaveLength(1);
	});

	it('refuses someone who holds no seat on the meeting', async () => {
		expect((await answerAs('an-administrator', false)).answer).toBe(seatControlRefusals.callerHasNoSeat);
	});
});
