import type { JournalLineInput } from './journalLine';
import { creditOf, debitOf } from './postingSides';

/** A supplier's cost as it posts: the account it is coded to, perhaps within a cost centre, and the amount. */
export type ExpenseCost = { expenseAccountId: string; costCentreId: string | null; amount: number };

/** Recording: the cost is debited to its account, and credited to where it is settled from, the bank or trade creditors. */
export function recordedCostLines(cost: ExpenseCost, settledFromAccountId: string): JournalLineInput[] {
	return [debitOf(cost.expenseAccountId, cost.amount, cost.costCentreId), creditOf(settledFromAccountId, cost.amount)];
}

/** Paying what is owed: trade creditors fall by the amount, and it leaves the bank. */
export function costPaymentLines(creditorsAccountId: string, bankAccountId: string, amount: number): JournalLineInput[] {
	return [debitOf(creditorsAccountId, amount), creditOf(bankAccountId, amount)];
}

/** What a cost's journal is called: the supplier, and what it was for when the person said. */
export function costJournalDescription(expense: { supplier: string; description: string }): string {
	if (expense.description === '') return expense.supplier;
	return `${expense.supplier}: ${expense.description}`;
}
