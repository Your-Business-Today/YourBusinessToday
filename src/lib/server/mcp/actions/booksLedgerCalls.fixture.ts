import { ledgerTables, ledgerWrites } from './booksLedgerDatabase.fixture';

type Row = Record<string, unknown>;

export const nigelAccountId = '00000000-0000-4000-8000-0000000a0001';

/** Set to the error the database gives when it refuses to delete a cost; null lets the delete through. */
export const costDeleteFailure: { error: { message: string } | null } = { error: null };

const DatabaseCalls = { deleteCost: 'delete_books_expense', accountDirectory: 'account_directory' } as const;

/** A stand-in for the database functions the books call: the cost delete, all or nothing, and the account directory. */
export async function ledgerCalls(name: string, args: Row): Promise<{ data: unknown; error: unknown }> {
	if (name === DatabaseCalls.accountDirectory) return { data: [{ id: nigelAccountId, display_name: 'Nigel', email: 'nigel@example.com' }], error: null };
	ledgerWrites.push({ table: name, kind: 'rpc', row: args });
	if (costDeleteFailure.error !== null) return { data: null, error: costDeleteFailure.error };
	return { data: deleteCostWithItsJournals(String(args.target_expense_id)), error: null };
}

function deleteCostWithItsJournals(expenseId: string): boolean {
	const cost = (ledgerTables.books_expenses ?? []).find((expense) => expense.id === expenseId);
	if (cost === undefined) return false;
	const journalIds = [cost.recorded_journal_id, cost.payment_journal_id];
	ledgerTables.books_expenses = ledgerTables.books_expenses.filter((expense) => expense !== cost);
	ledgerTables.books_journals = (ledgerTables.books_journals ?? []).filter((journal) => !journalIds.includes(journal.id));
	ledgerTables.books_journal_lines = (ledgerTables.books_journal_lines ?? []).filter((line) => !journalIds.includes(line.journal_id));
	return true;
}
