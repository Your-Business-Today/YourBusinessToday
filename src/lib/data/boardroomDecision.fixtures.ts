import { agendaItem } from './boardroomMeeting.fixtures';
import { meetingInRoom, said } from './boardroomRoom.fixtures';
import { modelArticlesRule, type BoardDecision, type DecisionAnswer, type DecisionAnswerKind, type MeetingDecisions } from './boardroomDecision';
import type { MeetingRecord } from './describeBoardroomMeeting';

export const decidedWording = 'Approve the accounts.';
export const decisionProposalId = 'nigels-proposal';
export const keptDecisionId = '1b2c3d4e-5f60-4718-9a0b-1c2d3e4f5a6b';

/** Item 1 is for decision: Nigel's Claude proposed the wording, Jeremy's supported it, and it came out agreed. */
export function meetingWithDecision(decisions: Partial<MeetingDecisions> = {}): MeetingRecord {
	const proposal = said('nigels-seat', 1, 'proposes', { id: decisionProposalId, wording: decidedWording });
	const support = said('jeremys-seat', 1, 'supports', { onProposalId: proposal.id });
	const outcome = { agendaItemId: 'item-1', outcome: 'agreed' as const, proposalId: proposal.id, wording: decidedWording, roundsTaken: 1, reachedAt: support.createdAt };
	const record = meetingInRoom({ contributions: [proposal, support], outcomes: [outcome] });
	const items = [{ ...agendaItem(1), purpose: 'decision' as const }, agendaItem(2)];
	return { ...record, items, decisions: { decisions: [], answers: [], ruleInForce: modelArticlesRule, ...decisions } };
}

/** The decision on item 1 as kept once the first director answered it, by the model articles, Jeremy in the chair. */
export function keptDecision(proposalId = decisionProposalId): BoardDecision {
	const base = { agendaItemId: 'item-1', meetingId: 'meeting', proposalId, wording: decidedWording, chairDirectorId: 'jeremys-seat' };
	return { id: keptDecisionId, ...base, rule: modelArticlesRule, replacesDecisionId: null, openedAt: '2026-11-12T11:00:00.000Z' };
}

let minute = 0;

export function answered(directorId: string, answer: DecisionAnswerKind, reason: string | null = null): DecisionAnswer {
	minute += 1;
	return { decisionId: keptDecisionId, directorId, answer, reason, answeredAt: new Date(Date.UTC(2026, 10, 12, 11, minute)).toISOString() };
}
