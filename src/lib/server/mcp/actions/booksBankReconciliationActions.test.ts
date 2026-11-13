import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ledgerTables } from './booksLedgerDatabase.fixture';
import { runOnTheBankLines as run } from './booksBankLineDatabase.fixture';
import { holdKeyedBooks, holdKeyedJournal, holdReconciledBooks, statementLines } from './booksBankReconciliationWorld.fixture';

const standing = vi.hoisted(() => ({ switchedOn: [] as string[] }));
vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Your Business Today' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => standing.switchedOn }));

const bankFeeJournalId = '00000000-0000-4000-8000-0000000f0004';
const coffee = { date: '2026-11-09', counterparty: 'COSTA COFFEE', reference: '', kind: 'CONTACTLESS', amount: -3.45, balanceAfter: 970.15 };

const reconciledReading = [
	"Bank reconciliation of Your Business Today's books on 1200 Bank at the end of 9 Nov 2026:",
	'- Statement: £973.60',
	'- Books: £973.60',
	'- Difference, the statement less the books: £0.00',
	'- Lines not yet matched: none',
	'- Entries in the books no line is matched to: none',
	'',
	'The bank is reconciled to 9 Nov 2026.'
].join('\n');

describe('reading whether the bank agrees with the statement', () => {
	beforeEach(async () => {
		standing.switchedOn = ['books'];
		await holdReconciledBooks();
	});

	it("says reconciled at the statement's last day when every line is matched to an entry already keyed", async () => {
		expect(await run('read_bank_reconciliation', { asAt: '2026-11-09' })).toBe(reconciledReading);
	});

	it('reads the statement and the books to the day asked, leaving out what came after', async () => {
		const answer = await run('read_bank_reconciliation', { asAt: '2026-11-05' });
		expect(answer).toContain('- Statement: £982.00\n- Books: £982.00\n');
		expect(answer).toContain('The bank is reconciled to 5 Nov 2026.');
	});

	it('shows a line brought in and never matched as a difference of its amount', async () => {
		await run('import_bank_lines', { applyRules: false, lines: [...statementLines, coffee] });
		const answer = await run('read_bank_reconciliation', { asAt: '2026-11-09' });
		expect(answer).toContain('- Statement: £970.15\n- Books: £973.60\n- Difference, the statement less the books: -£3.45');
		expect(answer).toContain('- Lines not yet matched: 1, £0.00 in and £3.45 out;');
		expect(answer).toContain('The bank is not reconciled to 9 Nov 2026.');
	});

	it('lists an entry on the bank that no line is matched to', async () => {
		holdKeyedJournal(bankFeeJournalId, '2026-11-08', 'Bank fee', -2);
		const answer = await run('read_bank_reconciliation', { asAt: '2026-11-09' });
		expect(answer).toContain('- Books: £971.60\n- Difference, the statement less the books: £2.00');
		expect(answer).toContain(`- Entries in the books no line is matched to: 1, oldest first:\n  - 8 Nov 2026: Bank fee, -£2.00. Journal ${bankFeeJournalId}`);
	});

	it('carries the last balance given on by the amounts of the lines after it', async () => {
		ledgerTables.books_bank_lines.at(-1)!.balance_after = null;
		expect(await run('read_bank_reconciliation', { asAt: '2026-11-09' })).toBe(reconciledReading);
		for (const line of ledgerTables.books_bank_lines) line.balance_after = null;
		const answer = await run('read_bank_reconciliation', { asAt: '2026-11-09' });
		expect(answer).toContain('- Statement: no line to that day gives a balance, so the difference cannot be read\n- Books: £973.60\n');
		expect(answer).toContain('The bank is not reconciled to 9 Nov 2026.');
	});

	it('refuses a day not written as one, and an account that holds no statement, reading nothing', async () => {
		expect(await run('read_bank_reconciliation', { asAt: '9 Nov' })).toBe('No reading was taken. asAt is a date written as 2026-11-30.');
		expect(await run('read_bank_reconciliation', { asAt: '2026-11-09', bankAccountCode: '6000' })).toContain('No reading was taken. 6000 Software is of type expense');
		ledgerTables.books_ledger_accounts = [];
		expect(await run('read_bank_reconciliation', { asAt: '2026-11-09' })).toBe(
			"Your Business Today's books have no Bank account yet, so there is nothing to reconcile."
		);
	});
});

describe('the bank on the front page of the books', () => {
	beforeEach(() => {
		standing.switchedOn = ['books'];
	});

	it('says the bank is reconciled to the last day of the statement', async () => {
		await holdReconciledBooks();
		expect(await run('read_books_overview', { monthKey: '2026-11' })).toContain('- Owed to suppliers: £0.00\nBank reconciled to 9 Nov 2026.\n');
	});

	it('counts the lines still to match, and says when no statement is in', async () => {
		holdKeyedBooks();
		expect(await run('read_books_overview', { monthKey: '2026-11' })).toContain('\nNo bank statement has been brought in yet.\n');
		await run('import_bank_lines', { applyRules: false, lines: statementLines });
		expect(await run('read_books_overview', { monthKey: '2026-11' })).toContain('\n3 bank lines to match.\n');
	});

	it('says when every line is matched but the bank still does not agree', async () => {
		await holdReconciledBooks();
		holdKeyedJournal(bankFeeJournalId, '2026-11-08', 'Bank fee', -2);
		expect(await run('read_books_overview', { monthKey: '2026-11' })).toContain(
			'\nEvery bank line is matched, but the bank does not agree with the statement at 9 Nov 2026; read_bank_reconciliation says why.\n'
		);
	});
});
