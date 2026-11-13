import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ledgerTables } from './booksLedgerDatabase.fixture';
import { heldInvoice, invoiceId, journalsOfKind, postedLines, runOnTheLedger } from './booksInvoicePostingWorld.fixture';
import { runOnTheBankLines } from './booksBankLineDatabase.fixture';
import { bankId, heldLine, holdBooksWithAStatement, keyedJournalId, lineIds, loanId, match, softwareId, trialBalance, unmatch } from './booksBankMatchWorld.fixture';

const standing = vi.hoisted(() => ({ switchedOn: ['books'] as string[] }));
vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Your Business Today' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => standing.switchedOn }));

const unmatched = { matched_journal_id: null, matched_as: null, matched_at: null, matched_by_account_id: null };
const thousandFromJewel = '00000000-0000-4000-8000-0000b2000010';

describe('taking a wrong match off a bank line', () => {
	beforeEach(async () => {
		standing.switchedOn = ['books'];
		await holdBooksWithAStatement();
	});

	it('takes a payment back off the invoice it settled, which reads issued and owes its total again', async () => {
		const before = trialBalance();
		await match(lineIds.jewel, { invoicePayment: { invoiceId } });
		const [payment] = journalsOfKind('invoice_payment');
		const answer = await unmatch(lineIds.jewel);
		expect(answer).toContain('Took the match off the line of 3 Nov 2026 with JEWEL BESPOKE BUILD for £1,020.50 in Your Business Today\'s books: the payment of £1,020.50 on invoice INV-6 from Jewel Bespoke Build was taken back by journal');
		expect(answer).toContain("dated the line's day; the invoice is issued and owes £1,020.50 again. The line is unmatched and can be matched again.");
		const [, reversal] = journalsOfKind('invoice_payment');
		expect(reversal).toEqual(expect.objectContaining({ journal_date: '2026-11-03', reverses_journal_id: payment.id }));
		expect(postedLines(reversal.id)[0]).toEqual(expect.objectContaining({ accountId: bankId, debit: 0, credit: 1020.5 }));
		expect(heldInvoice().status).toBe('issued');
		expect(ledgerTables.books_invoice_payments).toEqual([]);
		expect(heldLine(lineIds.jewel)).toEqual(expect.objectContaining(unmatched));
		expect(trialBalance()).toEqual(before);
		const read = await runOnTheBankLines('read_invoice', { invoiceId });
		expect(read).toContain('Total £1,020.50, paid £0.00, owed £1,020.50');
		expect(read).toContain(`Payments taken back, so not money received:\n- 3 Nov 2026: £1,020.50, taken back on 13 Nov 2026 by journal ${reversal.id}`);
		expect(await match(lineIds.jewel, { invoicePayment: { invoiceId } })).toContain('which settles it');
		expect(heldInvoice().status).toBe('paid');
	});

	it('leaves an invoice issued with its other payments standing when one payment is taken back', async () => {
		ledgerTables.books_bank_lines.push({ ...heldLine(lineIds.jewel), id: thousandFromJewel, line_date: '2026-11-04', amount: 1000, occurrence: 1 });
		await runOnTheLedger('record_invoice_payment', { invoiceId, paidOn: '2026-11-02', amount: 20.5 });
		await match(thousandFromJewel, { invoicePayment: { invoiceId } });
		expect(heldInvoice().status).toBe('paid');
		expect(await unmatch(thousandFromJewel)).toContain('the invoice is issued and owes £1,000.00 again');
		expect(heldInvoice().status).toBe('issued');
		expect(ledgerTables.books_invoice_payments).toEqual([expect.objectContaining({ amount: 20.5, paid_on: '2026-11-02' })]);
	});

	it('deletes a cost the line was matched as, keeping its deletion record, and the books read as before', async () => {
		const before = trialBalance();
		await match(lineIds.adobe, { cost: { description: 'Creative Cloud', expenseAccountId: softwareId } });
		const answer = await unmatch(lineIds.adobe);
		expect(answer).toContain('the cost from ADOBE for Creative Cloud was deleted with its journals, and list_books_deletions keeps the record.');
		expect(ledgerTables.books_expenses).toEqual([]);
		expect(ledgerTables.books_deletions).toEqual([expect.objectContaining({ kind: 'cost', known_as: 'ADOBE' })]);
		expect(heldLine(lineIds.adobe)).toEqual(expect.objectContaining(unmatched));
		expect(trialBalance()).toEqual(before);
	});

	it('reverses a movement to a loan account on the line day, so the loan reads as it did', async () => {
		const before = trialBalance();
		await match(lineIds.james, { account: { accountId: loanId, description: 'Loan from James' } });
		const [lent] = journalsOfKind('manual');
		expect(await unmatch(lineIds.james)).toContain(`the journal "Loan from James" was reversed by journal`);
		const [, reversal] = journalsOfKind('manual');
		expect(reversal).toEqual(expect.objectContaining({ journal_date: '2026-11-06', reverses_journal_id: lent.id }));
		expect(postedLines(reversal.id)).toEqual([
			{ accountId: bankId, costCentreId: null, debit: 0, credit: 500 },
			{ accountId: loanId, costCentreId: null, debit: 500, credit: 0 }
		]);
		expect(trialBalance()).toEqual(before);
		expect(heldLine(lineIds.james)).toEqual(expect.objectContaining(unmatched));
	});

	it('only unties an entry that was in the books before the match, posting nothing', async () => {
		await match(lineIds.anthropic, { existingJournal: { journalId: keyedJournalId } });
		const journalsBefore = [...ledgerTables.books_journals];
		expect(await unmatch(lineIds.anthropic)).toContain('the entry "Anthropic: Claude" was in the books before the match and stays as it was.');
		expect(ledgerTables.books_journals).toEqual(journalsBefore);
		expect(heldLine(lineIds.anthropic)).toEqual(expect.objectContaining(unmatched));
	});
});
