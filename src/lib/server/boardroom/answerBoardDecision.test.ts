import { beforeEach, describe, expect, it, vi } from 'vitest';
import { answerBoardDecision } from './answerBoardDecision';
import { boardDecisionRefusals } from '$lib/data/boardroomDecisionRules';
import { answered, keptDecision, keptDecisionId, meetingWithDecision } from '$lib/data/boardroomDecision.fixtures';
import { duringTheMeeting, meetingId, yourBusinessToday } from '$lib/data/boardroomMeeting.fixtures';
import type { BoardDecision, DecisionAnswer } from '$lib/data/boardroomDecision';
import type { DecisionAnswerDraft } from '$lib/data/validateDecisionAnswer';

const board = vi.hoisted(() => ({
	decisions: [] as BoardDecision[],
	answers: [] as DecisionAnswer[],
	isClosed: false,
	opened: [] as Record<string, unknown>[]
}));
vi.mock('./readBoardroomMeeting', () => ({
	getMeetingRecord: async () => {
		const record = meetingWithDecision({ decisions: board.decisions, answers: board.answers });
		const closedAt = board.isClosed ? '2026-11-12T12:00:00.000Z' : null;
		return { ...record, meeting: { ...record.meeting, closedAt } };
	}
}));
vi.mock('./saveBoardroomDecisions', () => ({
	insertBoardDecision: async (_supabase: unknown, _meeting: unknown, decision: { proposalId: string }) => {
		board.opened.push(decision);
		board.decisions.push(keptDecision(decision.proposalId));
		return keptDecisionId;
	},
	insertDecisionAnswer: async (_supabase: unknown, placing: { seatId: string }, draft: DecisionAnswerDraft) => {
		board.answers.push(answered(placing.seatId, draft.answer, draft.reason));
		return true;
	}
}));

function answerAs(accountId: string, draft: Partial<DecisionAnswerDraft> = {}) {
	const given = { itemNumber: 1, answer: 'agrees' as const, reason: null, ...draft };
	return answerBoardDecision({} as never, yourBusinessToday, meetingId, given, { accountId, now: duringTheMeeting });
}

describe('each director confirms a decision themselves', () => {
	beforeEach(() => {
		board.decisions = [];
		board.answers = [];
		board.isClosed = false;
		board.opened = [];
	});

	it('puts the decision with its agreed wording on the first answer, and keeps the answer for the caller’s own seat', async () => {
		const kept = await answerAs('nigel', { reason: 'The figures are right.' });
		expect(kept.isKept).toBe(true);
		expect(board.opened).toHaveLength(1);
		expect(board.answers).toMatchObject([{ directorId: 'nigels-seat', answer: 'agrees', reason: 'The figures are right.' }]);
		expect(kept.answer).toContain('Still to answer: Jeremy.');
	});

	it('records the result once every director has answered', async () => {
		await answerAs('nigel');
		const last = await answerAs('jeremy', { answer: 'agrees' });
		expect(board.opened).toHaveLength(1);
		expect(last.answer).toContain('Carried: more directors agreed than disagreed.');
	});

	it('takes each director’s answer once, and never changes it', async () => {
		await answerAs('nigel');
		expect(await answerAs('nigel', { answer: 'disagrees' })).toEqual({ answer: boardDecisionRefusals.alreadyAnswered, isKept: false });
		expect(board.answers).toHaveLength(1);
	});

	it('refuses anyone with no seat on the meeting, so nobody answers for a director', async () => {
		expect((await answerAs('an-administrator')).answer).toBe(boardDecisionRefusals.callerHasNoSeat);
		expect(board.answers).toEqual([]);
	});

	it('puts nothing to the directors on an item only to be noted', async () => {
		expect((await answerAs('nigel', { itemNumber: 2 })).answer).toBe(boardDecisionRefusals.noDecisionOnItem);
	});

	it('takes no answer once the meeting has closed', async () => {
		board.isClosed = true;
		expect((await answerAs('nigel')).answer).toBe(boardDecisionRefusals.meetingNotOpen);
		expect(board.answers).toEqual([]);
	});
});
