import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ledgerTables } from './booksLedgerDatabase.fixture';
import { heldInvoice, invoiceId, journalsOfKind, postedLines, runOnTheLedger } from './booksInvoicePostingWorld.fixture';
import { bankId, heldLine, holdBooksWithAStatement, keyedJournalId, lineIds, loanId, match, softwareId } from './booksBankMatchWorld.fixture';

const standing = vi.hoisted(() => ({ switchedOn: ['books'] as string[] }));
vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Your Business Today' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => standing.switchedOn }));

const nigel = '00000000-0000-4000-8000-0000000a0001';

describe('matching a bank line to what it was', () => {
	beforeEach(async () => {
		standing.switchedOn = ['books'];
		await holdBooksWithAStatement();
	});

	it('marks an issued invoice paid by the money in that settled it, dated the line day, posted into the bank', async () => {
		const answer = await match(lineIds.jewel, { invoicePayment: { invoiceId } });
		expect(answer).toContain("Matched the line of 3 Nov 2026 with JEWEL BESPOKE BUILD for £1,020.50 in Your Business Today's books as a payment on invoice INV-6");
		expect(answer).toContain('which settles it');
		const [payment] = journalsOfKind('invoice_payment');
		expect(payment.journal_date).toBe('2026-11-03');
		expect(postedLines(payment.id)[0]).toEqual({ accountId: bankId, costCentreId: null, debit: 1020.5, credit: 0 });
		expect(heldInvoice().status).toBe('paid');
		expect(heldLine(lineIds.jewel)).toEqual(expect.objectContaining({ matched_journal_id: payment.id, matched_as: 'invoice_payment', matched_by_account_id: nigel }));
	});

	it('keeps money out as a cost paid that day, which list_expenses shows as paid', async () => {
		const answer = await match(lineIds.adobe, { cost: { description: 'Creative Cloud', expenseAccountId: softwareId } });
		expect(answer).toContain('as a cost from ADOBE for Creative Cloud, paid that day. It is posted on the line\'s day.');
		const [cost] = ledgerTables.books_expenses;
		expect(cost).toEqual(expect.objectContaining({ supplier: 'ADOBE', amount: 84.99, expense_date: '2026-11-05', paid_on: '2026-11-05' }));
		expect(postedLines(cost.recorded_journal_id).map((line) => line.accountId)).toEqual([softwareId, bankId]);
		expect(await runOnTheLedger('list_expenses', {})).toContain('ADOBE, Creative Cloud, £84.99; 6000 Software');
		expect(heldLine(lineIds.adobe)).toEqual(expect.objectContaining({ matched_journal_id: cost.recorded_journal_id, matched_as: 'cost' }));
	});

	it('moves a loan account by money in and by money out, each in one journal against the bank', async () => {
		expect(await match(lineIds.james, { account: { accountId: loanId, description: 'Loan from James' } })).toContain(
			'as money moving to or from 2300 Loan account: James: Loan from James.'
		);
		await match(lineIds.coffee, { account: { accountId: loanId, description: "James's own coffee" } });
		const [lent, spent] = journalsOfKind('manual');
		expect(postedLines(lent.id)).toEqual([
			{ accountId: bankId, costCentreId: null, debit: 500, credit: 0 },
			{ accountId: loanId, costCentreId: null, debit: 0, credit: 500 }
		]);
		expect(postedLines(spent.id)).toEqual([
			{ accountId: loanId, costCentreId: null, debit: 3.45, credit: 0 },
			{ accountId: bankId, costCentreId: null, debit: 0, credit: 3.45 }
		]);
		const onTheLoan = ledgerTables.books_journal_lines.filter((line) => line.account_id === loanId);
		const owedToJamesPence = onTheLoan.reduce((total, line) => total + Math.round((Number(line.credit) - Number(line.debit)) * 100), 0);
		expect(owedToJamesPence).toBe(49655);
	});

	it('ties a line to an entry keyed already, posting nothing, and refuses a journal that is not the line', async () => {
		const journalCount = ledgerTables.books_journals.length;
		const answer = await match(lineIds.anthropic, { existingJournal: { journalId: keyedJournalId } });
		expect(answer).toContain('as the entry already in the books, "Anthropic: Claude". Nothing new was posted.');
		expect(ledgerTables.books_journals).toHaveLength(journalCount);
		expect(heldLine(lineIds.anthropic).matched_as).toBe('existing_journal');
		const wrongLine = await match(lineIds.coffee, { existingJournal: { journalId: keyedJournalId } });
		expect(wrongLine).toContain('Nothing was posted. Journal "Anthropic: Claude" posts -£18.00 to the statement\'s account on 7 Nov 2026, but the line is -£3.45');
	});
});
