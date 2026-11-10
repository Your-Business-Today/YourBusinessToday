import { beforeEach, describe, expect, it, vi } from 'vitest';
import { speakOnBoardroomItem } from './speakOnBoardroomItem';
import { boardDecisionRefusals } from '$lib/data/boardroomDecisionRules';
import { decisionOnItem } from '$lib/data/boardDecisionOnItem';
import { meetingInRoom } from '$lib/data/boardroomRoom.fixtures';
import { controlsOf } from '$lib/data/boardroomSeatControls.fixtures';
import { meetingWithDecision, keptDecisionId } from '$lib/data/boardroomDecision.fixtures';
import { duringTheMeeting, meetingId, yourBusinessToday } from '$lib/data/boardroomMeeting.fixtures';
import type { ContributionDraft } from '$lib/data/validateBoardContribution';

const board = vi.hoisted(() => ({ earlierDecisionIds: [] as string[], kept: [] as Record<string, unknown>[] }));
vi.mock('./readBoardroomMeeting', () => ({ getMeetingRecord: async () => meetingInRoom() }));
vi.mock('./getBoardroomSeatControls', () => ({ getControlsOfSeat: async (_supabase: unknown, _meetingId: string, seatId: string) => controlsOf(seatId) }));
vi.mock('./getBoardroomDecisions', () => ({
	isEarlierDecisionOfBoard: async (_supabase: unknown, replaced: { decisionId: string }) => board.earlierDecisionIds.includes(replaced.decisionId)
}));
vi.mock('./saveBoardroomRoom', () => ({
	insertBoardContribution: async (_supabase: unknown, placing: Record<string, unknown>) => {
		board.kept.push(placing);
		return null;
	},
	insertItemOutcome: async () => undefined
}));

const replacing: ContributionDraft = {
	itemNumber: 1,
	stance: 'proposes',
	words: 'The loan terms changed.',
	wording: 'Take the loan on the new terms.',
	proposalNumber: null,
	correctsNumber: null,
	replacesDecisionId: keptDecisionId
};

function speak() {
	return speakOnBoardroomItem({} as never, yourBusinessToday, meetingId, replacing, { accountId: 'nigel', now: duringTheMeeting });
}

describe('a later meeting replaces a decision with a new one that names it', () => {
	beforeEach(() => {
		board.earlierDecisionIds = [];
		board.kept = [];
	});

	it('refuses a proposal naming a decision this board did not take at an earlier meeting', async () => {
		expect(await speak()).toBe(boardDecisionRefusals.noSuchEarlierDecision);
		expect(board.kept).toEqual([]);
	});

	it('keeps the decision it replaces on the proposal', async () => {
		board.earlierDecisionIds = [keptDecisionId];
		await speak();
		expect(board.kept[0]).toMatchObject({ stance: 'proposes', replacesDecisionId: keptDecisionId });
	});

	it('puts the new decision to the directors naming the one it replaces', () => {
		const record = meetingWithDecision({}, { replacesDecisionId: keptDecisionId });
		const [decisionItem] = record.items;
		expect(decisionOnItem(record, decisionItem, duringTheMeeting)?.decision).toMatchObject({ replacesDecisionId: keptDecisionId });
	});
});
