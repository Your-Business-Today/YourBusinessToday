/** What the run did with one invoice or schedule; raised, issued and sent are moves made, the rest are named for a person. */
export const BillingRunMoves = {
	raised: 'raised',
	issued: 'issued',
	sent: 'sent',
	unsent: 'unsent',
	givenUp: 'given_up',
	skipped: 'skipped',
	failed: 'failed'
} as const;

export type BillingRunMove = (typeof BillingRunMoves)[keyof typeof BillingRunMoves];

/** One thing the run did or left, in a sentence a person reads as it is. */
export type BillingRunEvent = { move: BillingRunMove; sentence: string };

const movesMade: ReadonlySet<BillingRunMove> = new Set([BillingRunMoves.raised, BillingRunMoves.issued, BillingRunMoves.sent]);

/** How many invoices the run raised, issued and sent between them. */
export function movesMadeIn(events: BillingRunEvent[]): number {
	return events.filter((event) => movesMade.has(event.move)).length;
}

function countOf(events: BillingRunEvent[], move: BillingRunMove): number {
	return events.filter((event) => event.move === move).length;
}

/** The run in one line: what it raised, issued and sent, then every sentence in the order it happened. */
export function describeBillingRun(events: BillingRunEvent[]): string {
	if (events.length === 0) return 'Nothing was due: no invoice was raised, issued or sent.';
	const counts = [BillingRunMoves.raised, BillingRunMoves.issued, BillingRunMoves.sent].map((move) => `${move} ${countOf(events, move)}`);
	return [`Invoices ${counts.join(', ')}.`, ...events.map((event) => event.sentence)].join(' ');
}
