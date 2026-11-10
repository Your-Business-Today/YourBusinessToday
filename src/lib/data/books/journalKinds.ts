/** The kind values books_journals accepts (migration 0151), as yourbooks.today names them. */
export const journalKinds = [
	'manual',
	'invoice',
	'invoice_void',
	'invoice_payment',
	'expense',
	'expense_payment',
	'accrual',
	'accrual_reversal',
	'prepayment_release'
] as const;

export type JournalKind = (typeof journalKinds)[number];

export function isJournalKind(candidate: unknown): candidate is JournalKind {
	return (journalKinds as readonly unknown[]).includes(candidate);
}

/** The kind of a journal a person posts by hand, as opposed to one an invoice, payment or month-end entry posts. */
export const manualJournalKind: JournalKind = 'manual';

/** The kinds of the journals an invoice posts: its sale when issued, money received against it, and its void. */
export const InvoiceJournalKinds = {
	issue: 'invoice',
	payment: 'invoice_payment',
	void: 'invoice_void'
} as const satisfies Record<string, JournalKind>;
