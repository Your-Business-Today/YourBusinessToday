import type { JournalKind } from './journalKinds';

/** What posted each kind of journal, in the words the books page shows beside an entry. */
export const journalKindLabels: Record<JournalKind, string> = {
	manual: 'Journal',
	invoice: 'Invoice',
	invoice_void: 'Invoice voided',
	invoice_payment: 'Invoice paid',
	expense: 'Supplier cost',
	expense_payment: 'Supplier cost paid',
	accrual: 'Accrual',
	accrual_reversal: 'Accrual reversed',
	prepayment_release: 'Prepayment released'
};
