import { beforeEach, describe, expect, it, vi } from 'vitest';
import { speakOnBoardroomItem } from './speakOnBoardroomItem';
import { boardRoomRefusals } from '$lib/data/boardroomRoomRules';
import { boardroomMeetingRefusals } from '$lib/data/boardroomMeetingRules';
import { meetingInRoom, said } from '$lib/data/boardroomRoom.fixtures';
import { controlsOf } from '$lib/data/boardroomSeatControls.fixtures';
import { duringTheMeeting, meetingId, yourBusinessToday } from '$lib/data/boardroomMeeting.fixtures';
import type { BoardContribution, OutcomeDraft } from '$lib/data/boardroomRoom';
import type { MeetingRecord } from '$lib/data/describeBoardroomMeeting';
import type { ContributionDraft } from '$lib/data/validateBoardContribution';

const room = vi.hoisted(() => ({
	said: [] as BoardContribution[],
	isMissing: false,
	kept: [] as Record<string, unknown>[],
	outcomes: [] as OutcomeDraft[]
}));
vi.mock('./readBoardroomMeeting', () => ({
	getMeetingRecord: async (): Promise<MeetingRecord | null> => (room.isMissing ? null : meetingInRoom({ contributions: room.said }))
}));
vi.mock('./getBoardroomSeatControls', () => ({ getControlsOfSeat: async (_supabase: unknown, _meetingId: string, seatId: string) => controlsOf(seatId) }));
vi.mock('./saveBoardroomRoom', () => ({
	insertBoardContribution: async (_supabase: unknown, placing: Record<string, unknown>) => {
		room.kept.push(placing);
		const kept = { ...said(placing.seatId as string, placing.round as number, placing.stance as never), onProposalId: placing.onProposalId as string | null };
		room.said.push(kept);
		return kept.id;
	},
	insertItemOutcome: async (_supabase: unknown, _meeting: unknown, _itemId: string, draft: OutcomeDraft) => room.outcomes.push(draft)
}));

const support: ContributionDraft = { itemNumber: 1, stance: 'supports', words: 'Agreed.', wording: null, proposalNumber: 1, correctsNumber: null };

function speak(accountId: string, draft: ContributionDraft) {
	return speakOnBoardroomItem({} as never, yourBusinessToday, meetingId, draft, { accountId, now: duringTheMeeting });
}

describe('a director’s Claude speaks on an item in the room', () => {
	beforeEach(() => {
		room.said = [said('nigels-seat', 1, 'proposes')];
		room.isMissing = false;
		room.kept = [];
		room.outcomes = [];
	});

	it('keeps what it says under its own director’s seat and account, and the item comes out agreed', async () => {
		const answer = await speak('jeremy', support);
		expect(room.kept[0]).toMatchObject({ seatId: 'jeremys-seat', spokenBy: 'jeremy', round: 1, onProposalId: room.said[0].id });
		expect(answer).toContain('Kept as contribution 2 on item 1, in round 1.');
		expect(answer).toContain('Came out agreed in round 1; it goes to the directors as what the board proposes to note: "Approve the accounts."');
		expect(room.outcomes).toEqual([{ outcome: 'agreed', proposalId: room.said[0].id, wording: 'Approve the accounts.', roundsTaken: 1 }]);
	});

	it('says whose turn is left while the item is still being talked through', async () => {
		const answer = await speak('jeremy', { ...support, stance: 'objects', proposalNumber: null });
		expect(answer).toContain('Round 2 of 3.');
		expect(room.outcomes).toEqual([]);
	});

	it('refuses out of turn and for a meeting the organisation does not have, keeping nothing', async () => {
		expect(await speak('nigel', { ...support, stance: 'comments', proposalNumber: null })).toBe(boardRoomRefusals.alreadySpokenThisRound);
		room.isMissing = true;
		expect(await speak('jeremy', support)).toBe(boardroomMeetingRefusals.noSuchMeeting);
		expect(room.kept).toEqual([]);
	});
});
