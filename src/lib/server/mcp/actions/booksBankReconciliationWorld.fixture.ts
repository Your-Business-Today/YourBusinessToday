import { clearLedgerTables, ledgerTables } from './booksLedgerDatabase.fixture';
import { standDatabaseStepsDown } from './booksLedgerCalls.fixture';
import { heldBankLines, runOnTheBankLines } from './booksBankLineDatabase.fixture';

type Row = Record<string, unknown>;

const accounts = {
	bank: { id: '00000000-0000-4000-8000-000000001200', code: '1200', name: 'Bank', account_type: 'asset', is_system: true, is_archived: false },
	loan: { id: '00000000-0000-4000-8000-000000002300', code: '2300', name: 'Loan account: James', account_type: 'liability', is_system: false, is_archived: false },
	software: { id: '00000000-0000-4000-8000-000000006000', code: '6000', name: 'Software', account_type: 'expense', is_system: false, is_archived: false },
	sales: { id: '00000000-0000-4000-8000-000000004000', code: '4000', name: 'Sales', account_type: 'income', is_system: true, is_archived: false }
};
type Account = (typeof accounts)[keyof typeof accounts];

/** The journals keyed by hand before the statement came in: James's loan, Anthropic and GitHub, each paid through the bank. */
export const keyedJournalIds = {
	james: '00000000-0000-4000-8000-0000000f0001',
	anthropic: '00000000-0000-4000-8000-0000000f0002',
	github: '00000000-0000-4000-8000-0000000f0003'
};

/** The statement's lines, oldest first, each with the balance after it, as the person's Claude gives them. */
export const statementLines = [
	{ date: '2026-11-02', counterparty: 'BEADLE EM & GJ', reference: 'JAMES LOAN', kind: 'FASTER PAYMENT', amount: 1000, balanceAfter: 1000 },
	{ date: '2026-11-05', counterparty: 'ANTHROPIC', reference: 'CLAUDE', kind: 'CARD PAYMENT', amount: -18, balanceAfter: 982 },
	{ date: '2026-11-09', counterparty: 'GITHUB', reference: 'COPILOT', kind: 'CARD PAYMENT', amount: -8.4, balanceAfter: 973.6 }
];

/** Posts a journal of two sides on the day: money in to the bank from the other account, or out of it to the other. */
export function holdKeyedJournal(id: string, journalDate: string, description: string, bankAmount: number, other: Account = accounts.software): void {
	const books_journals = { journal_date: journalDate, description };
	ledgerTables.books_journals.push({ id, journal_date: journalDate, description, kind: 'manual' });
	const side = (account: Account, debit: number, credit: number, position: number): Row => ({
		id: `${id}-${position}`,
		journal_id: id,
		account_id: account.id,
		cost_centre_id: null,
		debit,
		credit,
		position,
		description: '',
		books_journals,
		books_ledger_accounts: account
	});
	const isMoneyIn = bankAmount > 0;
	const amount = Math.abs(bankAmount);
	ledgerTables.books_journal_lines.push(side(accounts.bank, isMoneyIn ? amount : 0, isMoneyIn ? 0 : amount, 0), side(other, isMoneyIn ? 0 : amount, isMoneyIn ? amount : 0, 1));
}

/** Your Business Today's books with the three journals keyed by hand and nothing yet brought in from the statement. */
export function holdKeyedBooks(): void {
	clearLedgerTables();
	standDatabaseStepsDown();
	ledgerTables.books_settings = [{ invoice_prefix: 'INV', next_invoice_number: 1, payment_terms_days: 30 }];
	ledgerTables.books_ledger_accounts = Object.values(accounts);
	Object.assign(ledgerTables, { books_journals: [], books_journal_lines: [], books_invoices: [], books_customers: [], books_expenses: [] });
	holdKeyedJournal(keyedJournalIds.james, '2026-11-02', 'Loan from James', 1000, accounts.loan);
	holdKeyedJournal(keyedJournalIds.anthropic, '2026-11-05', 'Anthropic: Claude', -18);
	holdKeyedJournal(keyedJournalIds.github, '2026-11-09', 'GitHub: Copilot', -8.4);
}

/** The keyed books with the statement brought in and each of its lines matched to the journal already keyed for it. */
export async function holdReconciledBooks(): Promise<void> {
	holdKeyedBooks();
	await runOnTheBankLines('import_bank_lines', { applyRules: false, lines: statementLines });
	const journalIds = [keyedJournalIds.james, keyedJournalIds.anthropic, keyedJournalIds.github];
	for (const [index, line] of heldBankLines().entries()) {
		await runOnTheBankLines('match_bank_line', { bankLineId: line.id, existingJournal: { journalId: journalIds[index] } });
	}
}
