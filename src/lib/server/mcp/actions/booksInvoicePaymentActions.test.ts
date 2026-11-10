import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ledgerTables, ledgerWrites } from './booksLedgerDatabase.fixture';
import {
	accountIdOfCode, heldInvoice, holdDraftInvoice, invoiceId, journalsOfKind, postedLines, runOnTheLedger as run
} from './booksInvoicePostingWorld.fixture';

const standing = vi.hoisted(() => ({ switchedOn: ['books'] as string[] }));
vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Jewel Enterprises' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => standing.switchedOn }));

const pay = (paidOn: string, amount: unknown) => run('record_invoice_payment', { invoiceId, paidOn, amount });

describe('recording money received against an invoice', () => {
	beforeEach(async () => {
		holdDraftInvoice();
		await run('issue_invoice', { invoiceId });
		ledgerWrites.length = 0;
	});

	it('posts part of what is owed into the bank and off trade debtors, and keeps it against the invoice', async () => {
		const answer = await pay('2026-11-20', 500);
		expect(answer).toContain("Recorded £500.00 received on 20 Nov 2026 and posted it to the bank in Jewel Enterprises's books.");
		expect(answer).toContain('Payments:\n- 20 Nov 2026: £500.00');
		expect(answer).toContain('Total £1,020.50, paid £500.00, owed £520.50');
		const [payment] = journalsOfKind('invoice_payment');
		expect(payment).toEqual(expect.objectContaining({ journal_date: '2026-11-20', description: 'Payment for invoice INV-6 from Jewel Bespoke Build' }));
		expect(postedLines(payment.id)).toEqual([
			{ accountId: accountIdOfCode('1200'), costCentreId: null, debit: 500, credit: 0 },
			{ accountId: accountIdOfCode('1100'), costCentreId: null, debit: 0, credit: 500 }
		]);
		expect(ledgerTables.books_invoice_payments).toEqual([expect.objectContaining({ invoice_id: invoiceId, paid_on: '2026-11-20', amount: 500, journal_id: payment.id })]);
		expect(heldInvoice().status).toBe('issued');
	});

	it('marks the invoice paid once what it owes is settled, and the list says nothing is owed', async () => {
		await pay('2026-11-20', 500);
		expect(await pay('2026-11-28', 520.5)).toContain('Total £1,020.50, paid £1,020.50, nothing owed');
		expect(heldInvoice().status).toBe('paid');
		expect(await run('list_invoices', {})).toContain('- INV-6 to Jewel Bespoke Build, paid, dated 1 Nov 2026, due 1 Dec 2026; Total £1,020.50, paid £1,020.50, nothing owed.');
		expect(await pay('2026-11-29', 1)).toBe('Nothing was posted. Invoice INV-6 is paid; money is recorded only against an issued invoice.');
	});

	it('refuses more than is owed, or a value the payment columns cannot hold, posting nothing', async () => {
		expect(await pay('2026-11-20', 1020.51)).toBe('Nothing was posted. Invoice INV-6 owes £1,020.50, and £1,020.51 is more than that.');
		expect(await pay('2026-11-20', 0)).toBe('Nothing was posted. amount is above zero; 0 was given.');
		expect(await pay('2026-11-20', 10.005)).toBe('Nothing was posted. amount has at most 2 decimal places; 10.005 was given.');
		expect(await pay('2026-11-20', -5)).toBe('Nothing was posted. amount cannot be below zero; -5 was given.');
		expect(await pay('20/11/2026', 10)).toBe('Nothing was posted. paidOn is a date written as 2026-11-30.');
		expect(ledgerWrites).toEqual([]);
	});

	it('refuses money against a draft, and the list says a draft is not yet owed', async () => {
		heldInvoice().status = 'draft';
		expect(await pay('2026-11-20', 10)).toBe('Nothing was posted. Invoice INV-6 is draft; money is recorded only against an issued invoice.');
		expect(await run('list_invoices', {})).toContain('Total £1,020.50, not owed until it is issued.');
		expect(ledgerWrites).toEqual([]);
	});
});
