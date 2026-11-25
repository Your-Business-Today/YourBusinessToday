import type { MonthKey } from '../monthKey';

/** The limits books_loan_budgets and its lines are held to (migration 0284), stated once for the service and any form. */
export const LoanBudgetLimits = { longestTitle: 120, longestName: 120, longestText: 1000, mostRepaymentMonths: 600 } as const;

/**
 * A loan kept ring-fenced in the books: what it is called, how much it is, who it is repaid to, the repayment each month,
 * the first month a repayment is made and how many months they run, and any notes.
 */
export type LoanBudgetSettings = {
	title: string;
	loanAmount: number;
	repaidTo: string;
	monthlyRepayment: number;
	firstRepaymentMonth: MonthKey;
	repaymentMonths: number;
	notes: string;
};

/** A part of the loan drawn into the bank in a month. */
export type LoanDrawSettings = { month: MonthKey; amount: number };

export type LoanDraw = LoanDrawSettings & { id: string };

/** What a line of the budget is for, how much of the loan it may spend, and the return it is expected to bring. */
export type LoanBudgetLineSettings = { purpose: string; amount: number; expectedReturn: string };

/** Who approved a line and when; a line is spent from only once a director has approved it. */
export type LineApproval = { approvedByName: string; approvedAt: string };

/** Money spent from a line: the day, how much, what it was, and the cost in the books it matches where there is one. */
export type LoanSpendSettings = { spentOn: string; amount: number; description: string; expenseId: string | null };

export type LoanSpend = LoanSpendSettings & { id: string };

export type LoanBudgetLine = LoanBudgetLineSettings & { id: string; approval: LineApproval | null; spends: LoanSpend[] };

export type LoanBudget = LoanBudgetSettings & { id: string; draws: LoanDraw[]; lines: LoanBudgetLine[] };
