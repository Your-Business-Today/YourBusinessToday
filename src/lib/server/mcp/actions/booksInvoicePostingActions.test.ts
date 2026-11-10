import { beforeEach, describe, expect, it, vi } from 'vitest';
import { moduleNotSwitchedOn } from '../organisationModuleGate';
import { ledgerTables, ledgerWrites } from './booksLedgerDatabase.fixture';
import {
	accountIdOfCode, heldInvoice, holdDraftInvoice, invoiceId, journalsOfKind, postedLines, projectsId,
	runOnTheLedger as run, salesId, writesTo
} from './booksInvoicePostingWorld.fixture';

const standing = vi.hoisted(() => ({ switchedOn: [] as string[] }));
vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Jewel Enterprises' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => standing.switchedOn }));

const movingNames = ['issue_invoice', 'record_invoice_payment', 'void_invoice', 'delete_invoice'];

describe('issuing, voiding and deleting an invoice', () => {
	beforeEach(() => {
		standing.switchedOn = ['books'];
		holdDraftInvoice();
	});

	it('change nothing for an organisation without Books', async () => {
		standing.switchedOn = [];
		for (const name of movingNames) expect(await run(name, { invoiceId, paidOn: '2026-11-20', amount: 10 })).toBe(moduleNotSwitchedOn('books'));
		expect(ledgerWrites).toEqual([]);
	});

	it('issue a draft: trade debtors owe the total, each line is credited to its income account, and the invoice is issued', async () => {
		const answer = await run('issue_invoice', { invoiceId });
		expect(answer).toContain("Issued invoice INV-6 and posted its sale to Jewel Enterprises's books: Jewel Bespoke Build owes £1,020.50, due 1 Dec 2026.");
		expect(answer).toContain('Total £1,020.50, paid £0.00, owed £1,020.50');
		const debtorsId = accountIdOfCode('1100');
		expect(writesTo('books_ledger_accounts')[0].row).toEqual(expect.objectContaining({ code: '1100', name: 'Trade debtors', account_type: 'asset', is_system: true }));
		const [sale] = journalsOfKind('invoice');
		expect(sale).toEqual(expect.objectContaining({ journal_date: '2026-11-01', description: 'Invoice INV-6 to Jewel Bespoke Build' }));
		expect(postedLines(sale.id)).toEqual([
			{ accountId: debtorsId, costCentreId: null, debit: 1020.5, credit: 0 },
			{ accountId: salesId, costCentreId: null, debit: 0, credit: 1000 },
			{ accountId: salesId, costCentreId: projectsId, debit: 0, credit: 20.5 }
		]);
		expect(heldInvoice()).toEqual(expect.objectContaining({ status: 'issued', issued_journal_id: sale.id }));
	});

	it('refuse to issue an invoice that is not a draft, or comes to nothing, posting nothing', async () => {
		ledgerTables.books_invoice_lines = [];
		expect(await run('issue_invoice', { invoiceId })).toBe('Nothing was posted. Invoice INV-6 comes to £0.00; an invoice is issued only when it comes to more than nothing.');
		heldInvoice().status = 'paid';
		expect(await run('issue_invoice', { invoiceId })).toBe('Nothing was posted. Invoice INV-6 is paid, and only a draft is issued.');
		expect(await run('issue_invoice', { invoiceId: 'six' })).toContain('Nothing was posted. The invoice must be an id');
		expect(ledgerWrites).toEqual([]);
	});

	it('refuse to post trade debtors to an account of another type kept at its code', async () => {
		ledgerTables.books_ledger_accounts.push({ id: 'travel', code: '1100', name: 'Travel', account_type: 'expense', is_system: false, is_archived: false });
		expect(await run('issue_invoice', { invoiceId })).toContain('but this chart keeps 1100 Travel there, of type expense');
		expect(ledgerWrites).toEqual([]);
	});

	it('void an issued invoice by reversing its sale, keeping the invoice and both journals', async () => {
		await run('issue_invoice', { invoiceId });
		const [sale] = journalsOfKind('invoice');
		expect(await run('void_invoice', { invoiceId })).toBe("Voided invoice INV-6 in Jewel Enterprises's books; its sale is reversed in the ledger.");
		const [reversal] = journalsOfKind('invoice_void');
		expect(reversal).toEqual(expect.objectContaining({ reverses_journal_id: sale.id, description: 'Void of invoice INV-6 to Jewel Bespoke Build' }));
		const swapped = postedLines(sale.id).map((line) => ({ ...line, debit: line.credit, credit: line.debit }));
		expect(postedLines(reversal.id)).toEqual(swapped);
		expect(heldInvoice().status).toBe('void');
		expect(await run('void_invoice', { invoiceId })).toBe('Nothing was posted. Invoice INV-6 is already void.');
	});

	it('void a draft without posting, and refuse to void an invoice that has been paid on', async () => {
		expect(await run('void_invoice', { invoiceId })).toBe("Voided invoice INV-6 in Jewel Enterprises's books; it had posted nothing, so nothing was reversed.");
		expect(ledgerTables.books_journals).toEqual([]);
		heldInvoice().status = 'issued';
		ledgerTables.books_invoice_payments = [{ id: 'paid-1', invoice_id: invoiceId, paid_on: '2026-11-20', amount: 100 }];
		expect(await run('void_invoice', { invoiceId })).toBe('Nothing was posted. Invoice INV-6 has payments recorded against it, so it is not voided.');
	});

	it('delete a draft or a void invoice, leaving the ledger as it was, and refuse to delete an issued one', async () => {
		await run('issue_invoice', { invoiceId });
		expect(await run('delete_invoice', { invoiceId })).toBe('Nothing was deleted. Invoice INV-6 is issued and posted to the ledger, so it is voided rather than deleted.');
		await run('void_invoice', { invoiceId });
		expect(await run('delete_invoice', { invoiceId })).toBe("Deleted void invoice INV-6 to Jewel Bespoke Build from Jewel Enterprises's books.");
		expect(ledgerTables.books_invoices).toEqual([]);
		expect(ledgerTables.books_journals.map((journal) => journal.kind)).toEqual(['invoice', 'invoice_void']);
	});
});
