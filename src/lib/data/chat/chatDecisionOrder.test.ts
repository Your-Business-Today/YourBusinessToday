import { describe, expect, it } from 'vitest';
import { decisionsByMessage, decisionsOpenFirst, openDecisionCount } from './chatDecisionOrder';
import type { ChatDecision } from './chatDecisionRules';

const decision: ChatDecision = {
	id: 'd1',
	roomId: 'finance',
	messageId: 'm1',
	wording: 'Take the Leeds job?',
	raisedByAccountId: 'james',
	raisedVia: 'site',
	waitingOnAccountId: 'nigel',
	status: 'open',
	outcome: null,
	closedByAccountId: null,
	closedAt: null,
	createdAt: '2026-11-20T09:00:00Z'
};

const olderOpen = { ...decision, id: 'older-open', createdAt: '2026-11-19T09:00:00Z' };
const newerOpen = { ...decision, id: 'newer-open', messageId: 'm2', createdAt: '2026-11-21T09:00:00Z' };
const closedLater = { ...decision, id: 'closed-later', status: 'closed' as const, outcome: 'Yes.', closedByAccountId: 'nigel', closedAt: '2026-11-22T09:00:00Z' };
const closedEarlier = { ...closedLater, id: 'closed-earlier', createdAt: '2026-11-22T08:00:00Z', closedAt: '2026-11-22T08:30:00Z' };

describe('decisionsOpenFirst', () => {
	it('puts the open decisions first, newest raised first, then the closed ones, latest closed first', () => {
		const ordered = decisionsOpenFirst([closedEarlier, olderOpen, closedLater, newerOpen]);
		expect(ordered.map((each) => each.id)).toEqual(['newer-open', 'older-open', 'closed-later', 'closed-earlier']);
	});
});

describe('openDecisionCount and decisionsByMessage', () => {
	it('counts the open decisions and gathers the decisions each message has, a message having more than one', () => {
		const decisions = [olderOpen, newerOpen, closedLater];
		expect(openDecisionCount(decisions)).toBe(2);
		const byMessage = decisionsByMessage(decisions);
		expect(byMessage.get('m1')?.map((each) => each.id)).toEqual(['older-open', 'closed-later']);
		expect(byMessage.get('m2')?.map((each) => each.id)).toEqual(['newer-open']);
	});
});
