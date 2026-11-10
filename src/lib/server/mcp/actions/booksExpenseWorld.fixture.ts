import { clearLedgerTables, ledgerTables } from './booksLedgerDatabase.fixture';

export const softwareId = '00000000-0000-4000-8000-000000006100';
export const prepaymentsId = '00000000-0000-4000-8000-000000001300';
export const salesId = '00000000-0000-4000-8000-000000004000';
export const projectsId = '00000000-0000-4000-8000-0000000cc001';
export const expenseId = '00000000-0000-4000-8000-0000000e0001';

/** A chart with no bank or trade creditors yet: software costs, Prepayments, Sales and the Projects cost centre. */
export function holdChartForCosts(): void {
	clearLedgerTables();
	ledgerTables.books_ledger_accounts = [
		{ id: softwareId, code: '6100', name: 'Software', account_type: 'expense', is_system: false, is_archived: false },
		{ id: prepaymentsId, code: '1300', name: 'Prepayments', account_type: 'asset', is_system: false, is_archived: false },
		{ id: salesId, code: '4000', name: 'Sales', account_type: 'income', is_system: true, is_archived: false }
	];
	ledgerTables.books_cost_centres = [{ id: projectsId, name: 'Projects', is_archived: false }];
	ledgerTables.books_expenses = [];
	ledgerTables.books_journals = [];
	ledgerTables.books_journal_lines = [];
}

/** A month's hosting from Vercel, recorded as owed, with no journal behind it, so the stand-in reads it by its own id. */
export function holdUnpaidHosting(): void {
	holdChartForCosts();
	ledgerTables.books_expenses = [
		{
			id: expenseId, expense_date: '2026-11-03', supplier: 'Vercel', description: 'Hosting', amount: 20, expense_account_id: softwareId,
			cost_centre_id: null, paid_on: null, recorded_journal_id: null, payment_journal_id: null
		}
	];
}

/** The cost the books hold with that id, or nothing when they no longer hold it. */
export function heldExpense(id: unknown = expenseId): Record<string, unknown> | undefined {
	return (ledgerTables.books_expenses ?? []).find((expense) => expense.id === id);
}
