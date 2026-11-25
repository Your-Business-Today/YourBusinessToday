import type { LoanSpend, LoanSpendSettings } from '$lib/data/books/loanBudget/loanBudget';

export const loanSpendsTable = 'books_loan_spends';

export const loanSpendColumns = 'id, line_id, spent_on, amount, description, expense_id';

export type LoanSpendRow = { id: string; line_id: string; spent_on: string; amount: number | string; description: string; expense_id: string | null };

/** A spend as books_loan_spends' columns, against the line it was spent from. */
export function toLoanSpendColumns(organisationId: string, lineId: string, spend: LoanSpendSettings): Record<string, unknown> {
	const { spentOn, amount, description, expenseId } = spend;
	return { organisation_id: organisationId, line_id: lineId, spent_on: spentOn, amount, description, expense_id: expenseId };
}

export function fromLoanSpendRow(row: LoanSpendRow): LoanSpend {
	return { id: row.id, spentOn: row.spent_on, amount: Number(row.amount), description: row.description, expenseId: row.expense_id ?? null };
}
