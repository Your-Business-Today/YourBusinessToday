import type { ListedChatDecision } from '$lib/data/chat/chatDecisionRules';

export const nigelAccountId = '00000000-0000-4000-8000-0000000000c1';

const raisedInFinance: ListedChatDecision = {
	id: '00000000-0000-4000-8000-0000000000d1',
	roomId: '00000000-0000-4000-8000-000000000002',
	messageId: '00000000-0000-4000-8000-0000000000b1',
	wording: 'Do we take the Leeds job?',
	raisedByAccountId: '00000000-0000-4000-8000-0000000000a1',
	raisedVia: 'claude',
	waitingOnAccountId: nigelAccountId,
	status: 'open',
	outcome: null,
	closedByAccountId: null,
	closedAt: null,
	createdAt: '2026-11-22T09:00:00Z',
	roomName: 'Finance',
	messageWords: 'Leeds want us in March.',
	raiserName: 'James',
	waitingOnName: 'Nigel',
	closerName: null
};

/** An open decision raised by James's Claude in Finance, waiting on Nigel. */
export const waitingOnNigel = raisedInFinance;

/** An open decision in Finance waiting on James, from a message of files alone. */
export const waitingOnJames: ListedChatDecision = {
	...raisedInFinance,
	id: '00000000-0000-4000-8000-0000000000d2',
	wording: 'Which van do we buy?',
	raisedVia: 'site',
	waitingOnAccountId: raisedInFinance.raisedByAccountId,
	waitingOnName: 'James',
	messageWords: ''
};

/** A decision Nigel closed with its outcome. */
export const closedByNigel: ListedChatDecision = {
	...raisedInFinance,
	id: '00000000-0000-4000-8000-0000000000d3',
	wording: 'Renew the insurance?',
	status: 'closed',
	outcome: 'Yes, with the same broker.',
	closedByAccountId: nigelAccountId,
	closedAt: '2026-11-23T10:00:00Z',
	closerName: 'Nigel'
};
