import type { LoanBudget, LoanBudgetLine, LoanBudgetSettings, LoanDraw } from '$lib/data/books/loanBudget/loanBudget';
import { monthOfDay, monthStart } from '$lib/data/books/monthKey';

export const LoanBudgetTables = { budgets: 'books_loan_budgets', draws: 'books_loan_draws', lines: 'books_loan_budget_lines' } as const;

export const loanBudgetColumns = 'id, title, loan_amount, repaid_to, monthly_repayment, first_repayment_month, repayment_months, notes';

export const loanDrawColumns = 'id, budget_id, month, amount';

export const loanBudgetLineColumns = 'id, budget_id, purpose, amount, expected_return, approved_by_name, approved_at';

export type LoanBudgetRow = {
	id: string;
	title: string;
	loan_amount: number | string;
	repaid_to: string;
	monthly_repayment: number | string;
	first_repayment_month: string;
	repayment_months: number;
	notes: string;
};

export type LoanDrawRow = { id: string; budget_id: string; month: string; amount: number | string };

export type LoanBudgetLineRow = {
	id: string;
	budget_id: string;
	purpose: string;
	amount: number | string;
	expected_return: string;
	approved_by_name: string | null;
	approved_at: string | null;
};

/** The settings given, as books_loan_budgets' columns, each month kept as its first day. */
export function toLoanBudgetColumns(settings: Partial<LoanBudgetSettings>): Record<string, unknown> {
	const columns = {
		title: settings.title,
		loan_amount: settings.loanAmount,
		repaid_to: settings.repaidTo,
		monthly_repayment: settings.monthlyRepayment,
		first_repayment_month: settings.firstRepaymentMonth === undefined ? undefined : monthStart(settings.firstRepaymentMonth),
		repayment_months: settings.repaymentMonths,
		notes: settings.notes
	};
	return Object.fromEntries(Object.entries(columns).filter(([, value]) => value !== undefined));
}

export function fromLoanBudgetRow(row: LoanBudgetRow, draws: LoanDraw[], lines: LoanBudgetLine[]): LoanBudget {
	return {
		id: row.id,
		title: row.title,
		loanAmount: Number(row.loan_amount),
		repaidTo: row.repaid_to,
		monthlyRepayment: Number(row.monthly_repayment),
		firstRepaymentMonth: monthOfDay(row.first_repayment_month),
		repaymentMonths: row.repayment_months,
		notes: row.notes,
		draws,
		lines
	};
}

export function fromLoanDrawRow(row: LoanDrawRow): LoanDraw {
	return { id: row.id, month: monthOfDay(row.month), amount: Number(row.amount) };
}

export function fromLoanBudgetLineRow(row: LoanBudgetLineRow): LoanBudgetLine {
	const approvedByName = row.approved_by_name ?? null;
	const approvedAt = row.approved_at ?? null;
	const approval = approvedByName === null || approvedAt === null ? null : { approvedByName, approvedAt };
	return { id: row.id, purpose: row.purpose, amount: Number(row.amount), expectedReturn: row.expected_return, approval };
}
