import { beforeEach, describe, expect, it, vi } from 'vitest';
import { moduleNotSwitchedOn } from '../organisationModuleGate';
import { ledgerTables, ledgerWrites } from './booksLedgerDatabase.fixture';
import { databaseStepStanding, meanwhile } from './booksLedgerCalls.fixture';
import { heldInvoice, invoiceId } from './booksInvoicePostingWorld.fixture';
import { runOnTheBankLines as run } from './booksBankLineDatabase.fixture';
import { bankId, heldLine, holdBooksWithAStatement, keyedJournalId, lineIds, loanId, match, softwareId } from './booksBankMatchWorld.fixture';

const standing = vi.hoisted(() => ({ switchedOn: ['books'] as string[] }));
vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Your Business Today' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => standing.switchedOn }));

const loan = { account: { accountId: loanId, description: 'Loan from James' } };
const writesOtherThanReads = () => ledgerWrites.filter((write) => write.kind !== 'select');

describe('what a bank line match refuses, and the races', () => {
	beforeEach(async () => {
		standing.switchedOn = ['books'];
		await holdBooksWithAStatement();
	});

	it('changes nothing for an organisation without Books', async () => {
		standing.switchedOn = [];
		expect(await match(lineIds.james, loan)).toBe(moduleNotSwitchedOn('books'));
		expect(writesOtherThanReads()).toEqual([]);
	});

	it('refuses a second match of a line, and a journal another line holds, by name', async () => {
		await match(lineIds.james, loan);
		expect(await match(lineIds.james, loan)).toContain('Nothing was posted. The line of 6 Nov 2026 with BEADLE EM & GJ for £500.00 is matched already, to journal');
		await match(lineIds.anthropic, { existingJournal: { journalId: keyedJournalId } });
		ledgerTables.books_bank_lines.push({ ...heldLine(lineIds.anthropic), id: '00000000-0000-4000-8000-0000b2000009', matched_journal_id: null, occurrence: 2 });
		const twice = await match('00000000-0000-4000-8000-0000b2000009', { existingJournal: { journalId: keyedJournalId } });
		expect(twice).toBe(`Nothing was posted. Journal ${keyedJournalId} is matched already, to bank line ${lineIds.anthropic}; a journal is matched by one line.`);
	});

	it('refuses money moving the wrong way for the kind, or not one kind, posting nothing', async () => {
		expect(await match(lineIds.adobe, { invoicePayment: { invoiceId } })).toBe('Nothing was posted. The line is money out (-£84.99); invoicePayment matches money in only.');
		expect(await match(lineIds.james, { cost: { expenseAccountId: softwareId } })).toBe('Nothing was posted. The line is money in (£500.00); cost matches money out only.');
		expect(await match(lineIds.james, {})).toContain('Give exactly one of invoicePayment, cost, account, existingJournal');
		expect(await match(lineIds.james, { ...loan, cost: {} })).toContain('2 were given.');
		expect(await match(lineIds.james, { account: 'loan' })).toBe('Nothing was posted. account is an object holding what the line was; "loan" was given.');
		expect(await match('line-1', loan)).toContain('The bank line must be an id');
		expect(await match('00000000-0000-4000-8000-0000b2999999', loan)).toContain('No bank line 00000000-0000-4000-8000-0000b2999999');
		expect(await match(lineIds.james, { account: { accountId: bankId, description: 'Itself' } })).toContain('1200 Bank is the account the statement is of');
		expect(await match(lineIds.james, { account: { accountId: loanId } })).toBe('Nothing was posted. description says what the journal is for.');
		expect(await match(lineIds.jewel, { invoicePayment: { invoiceId } })).toContain('which settles it');
		const overpaid = await match(lineIds.james, { invoicePayment: { invoiceId } });
		expect(overpaid).toBe('Nothing was posted. Invoice INV-6 is paid; money is recorded only against an issued invoice.');
		expect(ledgerTables.books_journals.filter((journal) => journal.kind === 'manual')).toEqual([]);
	});

	it('refuses, posting nothing, a line another caller matched meanwhile', async () => {
		meanwhile(() => match(lineIds.jewel, { invoicePayment: { invoiceId } }));
		const answer = await match(lineIds.jewel, { invoicePayment: { invoiceId } });
		expect(answer).toContain('Nothing was posted. The line of 3 Nov 2026 with JEWEL BESPOKE BUILD for £1,020.50 was matched, or what it was to be matched to changed');
		expect(ledgerTables.books_invoice_payments).toHaveLength(1);
		expect(heldInvoice().status).toBe('paid');
	});

	it('reads the line again when the answer is lost, and says it was matched once', async () => {
		databaseStepStanding.isAnswerLost = true;
		expect(await match(lineIds.adobe, { cost: { expenseAccountId: softwareId } })).toContain('Matched the line of 5 Nov 2026 with ADOBE');
		expect(ledgerTables.books_expenses).toHaveLength(1);
		expect(heldLine(lineIds.adobe).matched_as).toBe('cost');
	});

	it('lists what each matched line was matched to', async () => {
		await match(lineIds.james, loan);
		await match(lineIds.anthropic, { existingJournal: { journalId: keyedJournalId } });
		const listing = await run('list_bank_lines', {});
		expect(listing).toContain('5 shown, 3 unmatched.');
		expect(listing).toContain('BEADLE EM & GJ, £500.00; matched as money to or from another account, "Loan from James" journal');
		expect(listing).toContain(`ANTHROPIC, -£18.00; matched as an entry already in the books, "Anthropic: Claude" journal ${keyedJournalId}. Id`);
		expect(await run('list_bank_lines', { matching: 'matched' })).toContain('2 shown, 0 unmatched.');
	});
});
