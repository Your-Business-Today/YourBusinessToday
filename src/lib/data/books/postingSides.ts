import type { JournalLineInput } from './journalLine';

const nothing = 0;

/** A line putting the amount on the debit side of the account. */
export function debitOf(accountId: string, amount: number, costCentreId: string | null = null): JournalLineInput {
	return { accountId, costCentreId, debit: amount, credit: nothing };
}

/** A line putting the amount on the credit side of the account. */
export function creditOf(accountId: string, amount: number, costCentreId: string | null = null): JournalLineInput {
	return { accountId, costCentreId, debit: nothing, credit: amount };
}
