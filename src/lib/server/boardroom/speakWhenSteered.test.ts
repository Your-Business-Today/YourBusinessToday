import { beforeEach, describe, expect, it, vi } from 'vitest';
import { speakOnBoardroomItem } from './speakOnBoardroomItem';
import { seatControlRefusals } from '$lib/data/boardroomSeatControlRules';
import { meetingInRoom, said } from '$lib/data/boardroomRoom.fixtures';
import { controlsOf, heldPiece, settingChange } from '$lib/data/boardroomSeatControls.fixtures';
import { duringTheMeeting, meetingId, yourBusinessToday } from '$lib/data/boardroomMeeting.fixtures';
import type { SeatControls } from '$lib/data/boardroomSeatControls';
import type { ContributionDraft } from '$lib/data/validateBoardContribution';

const room = vi.hoisted(() => ({
	controls: null as SeatControls | null,
	keptInRoom: [] as Record<string, unknown>[],
	held: [] as Record<string, unknown>[]
}));
vi.mock('./readBoardroomMeeting', () => ({ getMeetingRecord: async () => meetingInRoom({ contributions: [said('nigels-seat', 1, 'proposes')] }) }));
vi.mock('./getBoardroomSeatControls', () => ({ getControlsOfSeat: async () => room.controls }));
vi.mock('./saveBoardroomRoom', () => ({ insertBoardContribution: async (_supabase: unknown, placing: Record<string, unknown>) => room.keptInRoom.push(placing) }));
vi.mock('./saveBoardroomSeatControls', () => ({ insertHeldContribution: async (_supabase: unknown, placing: Record<string, unknown>) => room.held.push(placing) }));

const comment: ContributionDraft = { itemNumber: 1, stance: 'comments', words: 'Not yet.', wording: null, proposalNumber: null, correctsNumber: null, replacesDecisionId: null };

function speakAsJeremy() {
	return speakOnBoardroomItem({} as never, yourBusinessToday, meetingId, comment, { accountId: 'jeremy', now: duringTheMeeting });
}

describe('a director’s Claude speaks only as its director allows', () => {
	beforeEach(() => {
		room.keptInRoom = [];
		room.held = [];
	});

	it('says nothing while its director has paused it', async () => {
		room.controls = controlsOf('jeremys-seat', { settingChanges: [settingChange('paused', true, 1)] });
		expect(await speakAsJeremy()).toBe(seatControlRefusals.claudeIsPaused);
		expect(room.keptInRoom).toEqual([]);
		expect(room.held).toEqual([]);
	});

	it('speaks again once its director has let it go on', async () => {
		const pauseThenLift = [settingChange('paused', true, 1), settingChange('paused', false, 2)];
		room.controls = controlsOf('jeremys-seat', { settingChanges: pauseThenLift });
		await speakAsJeremy();
		expect(room.keptInRoom).toHaveLength(1);
	});

	it('holds its piece for its director’s yes when asked to ask first, and says nothing in the room', async () => {
		room.controls = controlsOf('jeremys-seat', { settingChanges: [settingChange('ask_me_first', true, 1)] });
		const answer = await speakAsJeremy();
		expect(answer).toContain('Held for your director’s yes');
		expect(room.keptInRoom).toEqual([]);
		expect(room.held[0]).toMatchObject({ seatId: 'jeremys-seat', spokenBy: 'jeremy', agendaItemId: 'item-1', words: 'Not yet.' });
	});

	it('holds no second piece on an item while one still waits for an answer', async () => {
		const askFirst = [settingChange('ask_me_first', true, 1)];
		room.controls = controlsOf('jeremys-seat', { settingChanges: askFirst, held: [heldPiece()] });
		expect(await speakAsJeremy()).toBe(seatControlRefusals.alreadyHolding);
		expect(room.held).toEqual([]);
	});
});
