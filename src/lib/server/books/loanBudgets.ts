import type { SupabaseClient } from '@supabase/supabase-js';
import type { LoanBudget } from '$lib/data/books/loanBudget/loanBudget';
import { validateRecordId } from '$lib/data/isUuid';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import {
	LoanBudgetTables,
	fromLoanBudgetLineRow,
	fromLoanBudgetRow,
	fromLoanDrawRow,
	loanBudgetColumns,
	loanBudgetLineColumns,
	loanDrawColumns,
	type LoanBudgetLineRow,
	type LoanBudgetRow,
	type LoanDrawRow
} from './loanBudgetRecord';
import { fromLoanSpendRow, loanSpendColumns, loanSpendsTable, type LoanSpendRow } from './loanSpendRecord';

/** Every loan budget in the organisation's books, by title, each with its draws by month and its lines as they were added. */
export async function findLoanBudgets(supabase: SupabaseClient, organisationId: string): Promise<LoanBudget[]> {
	const [budgets, draws, lines, spends] = await Promise.all([
		supabase.from(LoanBudgetTables.budgets).select(loanBudgetColumns).eq('organisation_id', organisationId).order('title'),
		supabase.from(LoanBudgetTables.draws).select(loanDrawColumns).eq('organisation_id', organisationId).order('month'),
		supabase.from(LoanBudgetTables.lines).select(loanBudgetLineColumns).eq('organisation_id', organisationId).order('created_at'),
		supabase.from(loanSpendsTable).select(loanSpendColumns).eq('organisation_id', organisationId).order('spent_on')
	]);
	const failure = budgets.error ?? draws.error ?? lines.error ?? spends.error;
	if (failure !== null) throw failure;
	const drawRows = draws.data as LoanDrawRow[];
	const lineRows = linesWithSpends(lines.data as LoanBudgetLineRow[], spends.data as LoanSpendRow[]);
	return (budgets.data as LoanBudgetRow[]).map((row) =>
		fromLoanBudgetRow(
			row,
			drawRows.filter((draw) => draw.budget_id === row.id).map(fromLoanDrawRow),
			lineRows.filter((held) => held.budgetId === row.id).map((held) => held.budgetLine)
		)
	);
}

function linesWithSpends(lineRows: LoanBudgetLineRow[], spendRows: LoanSpendRow[]) {
	return lineRows.map((row) => {
		const spends = spendRows.filter((spend) => spend.line_id === row.id).map(fromLoanSpendRow);
		return { budgetId: row.budget_id, budgetLine: fromLoanBudgetLineRow(row, spends) };
	});
}

/** The organisation's loan budget with the id, or a refusal naming the reading that lists them. */
export async function findLoanBudget(supabase: SupabaseClient, organisationId: string, budgetId: unknown): Promise<LoanBudget> {
	const id = String(budgetId ?? '');
	refuseWhen(validateRecordId('loan budget', id));
	const budget = (await findLoanBudgets(supabase, organisationId)).find((candidate) => candidate.id === id);
	if (budget === undefined) throw new BooksRefusal(`No loan budget ${id} is in this organisation's books; read_loan_budgets lists them.`);
	return budget;
}

/** The budget that holds the line with the id, and the line, or a refusal naming the reading that lists them. */
export async function findLoanBudgetLine(supabase: SupabaseClient, organisationId: string, lineId: unknown) {
	const id = String(lineId ?? '');
	refuseWhen(validateRecordId('budget line', id));
	const budgets = await findLoanBudgets(supabase, organisationId);
	const budget = budgets.find((candidate) => candidate.lines.some((line) => line.id === id));
	if (budget === undefined) throw new BooksRefusal(`No budget line ${id} is in this organisation's books; read_loan_budgets lists them.`);
	return { budget, line: budget.lines.find((line) => line.id === id) as LoanBudget['lines'][number] };
}
