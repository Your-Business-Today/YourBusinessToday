import { ledgerTables, ledgerWrites } from './booksLedgerDatabase.fixture';
import { standDatabaseStepsDown } from './booksLedgerCalls.fixture';
import { holdDraftInvoice, invoiceId, runOnTheLedger } from './booksInvoicePostingWorld.fixture';
import { organisationId, runOnTheBankLines } from './booksBankLineDatabase.fixture';

type Row = Record<string, unknown>;

export const bankId = '00000000-0000-4000-8000-000000001200';
export const softwareId = '00000000-0000-4000-8000-000000006000';
export const loanId = '00000000-0000-4000-8000-000000002300';
export const keyedJournalId = '00000000-0000-4000-8000-0000000f0001';

/** The statement's lines: Jewel paying invoice 6 in full, Adobe, James lending £500, Anthropic keyed by hand already, a coffee. */
export const lineIds = {
	jewel: '00000000-0000-4000-8000-0000b2000001',
	adobe: '00000000-0000-4000-8000-0000b2000002',
	james: '00000000-0000-4000-8000-0000b2000003',
	anthropic: '00000000-0000-4000-8000-0000b2000004',
	coffee: '00000000-0000-4000-8000-0000b2000005'
};

const statement: [string, string, string, number][] = [
	[lineIds.jewel, '2026-11-03', 'JEWEL BESPOKE BUILD', 1020.5],
	[lineIds.adobe, '2026-11-05', 'ADOBE', -84.99],
	[lineIds.james, '2026-11-06', 'BEADLE EM & GJ', 500],
	[lineIds.anthropic, '2026-11-07', 'ANTHROPIC', -18],
	[lineIds.coffee, '2026-11-08', 'COSTA COFFEE', -3.45]
];

function bankLineRow([id, line_date, counterparty, amount]: [string, string, string, number], position: number): Row {
	const columns = { organisation_id: organisationId, bank_account_id: bankId, line_date, counterparty, reference: '', kind: '', amount };
	return { id, ...columns, balance_after: null, position: position + 1, occurrence: 1, matched_journal_id: null, matched_as: null };
}

/** Anthropic's £18.00 on 7 Nov 2026, keyed as a cost paid from the bank before the statement came in. */
function holdKeyedAnthropic(): void {
	ledgerTables.books_journals.push({ id: keyedJournalId, journal_date: '2026-11-07', description: 'Anthropic: Claude', kind: 'expense' });
	ledgerTables.books_journal_lines.push(
		{ id: 'keyed-1', journal_id: keyedJournalId, account_id: softwareId, cost_centre_id: null, debit: 18, credit: 0 },
		{ id: 'keyed-2', journal_id: keyedJournalId, account_id: bankId, cost_centre_id: null, debit: 0, credit: 18 }
	);
}

/** Invoice 6 issued to Jewel Bespoke Build for £1,020.50, a chart with the bank, software and James's loan, and the statement. */
export async function holdBooksWithAStatement(): Promise<void> {
	holdDraftInvoice();
	standDatabaseStepsDown();
	ledgerTables.books_ledger_accounts.push(
		{ id: bankId, code: '1200', name: 'Bank', account_type: 'asset', is_system: true, is_archived: false },
		{ id: softwareId, code: '6000', name: 'Software', account_type: 'expense', is_system: false, is_archived: false },
		{ id: loanId, code: '2300', name: 'Loan account: James', account_type: 'liability', is_system: false, is_archived: false }
	);
	ledgerTables.books_expenses = [];
	await runOnTheLedger('issue_invoice', { invoiceId });
	holdKeyedAnthropic();
	ledgerTables.books_bank_lines = statement.map(bankLineRow);
	ledgerWrites.length = 0;
}

/** Matches the statement line as the input says it was. */
export function match(bankLineId: string, said: Row) {
	return runOnTheBankLines('match_bank_line', { bankLineId, ...said });
}

/** The statement line the books hold with that id. */
export function heldLine(id: string): Row {
	return (ledgerTables.books_bank_lines ?? []).find((line) => line.id === id) ?? {};
}
