import { beforeEach, describe, expect, it, vi } from 'vitest';
import { booksActions } from './booksActions';
import { isGatedByModuleRule, moduleNotSwitchedOn } from '../organisationModuleGate';
import {
	bankId, customerId, draftId, heldTables, holdOneDraftInvoice, invoiceWrites, organisationId, projectsId,
	runInvoiceAction as run, salesId, sixthInvoice, websiteBuild
} from './booksInvoiceDatabase.fixture';

const invoiceNames = ['create_invoice', 'update_draft_invoice', 'read_invoice', 'list_invoices'];

const standing = vi.hoisted(() => ({ switchedOn: [] as string[] }));
vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Jewel Enterprises' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => standing.switchedOn }));

const writesTo = (table: string) => invoiceWrites.filter((write) => write.table === table);

describe('the invoice actions', () => {
	beforeEach(() => {
		standing.switchedOn = ['books'];
		holdOneDraftInvoice();
	});

	it('are each built by the one module rule, and change nothing for an organisation without Books', async () => {
		const invoiceActions = booksActions.filter((action) => invoiceNames.includes(action.name));
		expect(invoiceActions.filter((action) => !isGatedByModuleRule(action) || action.module !== 'books')).toEqual([]);
		expect(invoiceActions).toHaveLength(invoiceNames.length);
		standing.switchedOn = [];
		for (const name of invoiceNames) expect(await run(name, { invoiceId: draftId, customerId, lines: [websiteBuild] })).toBe(moduleNotSwitchedOn('books'));
		expect(invoiceWrites).toEqual([]);
	});

	it('draft an invoice with its lines under the next number, due after the payment terms, and move the numbering on', async () => {
		const lines = [websiteBuild, { ...websiteBuild, description: 'Hosting', quantity: 1, unitPrice: 20.5, costCentreId: projectsId }];
		const answer = await run('create_invoice', { customerId, issueDate: '2026-11-10', reference: 'PO 12', lines });
		const invoiceRow = { organisation_id: organisationId, invoice_number: 7, status: 'draft', customer_id: customerId, issue_date: '2026-11-10', due_date: '2026-11-24', reference: 'PO 12', notes: '' };
		expect(writesTo('books_invoices')).toEqual([{ table: 'books_invoices', kind: 'insert', row: invoiceRow }]);
		const [lineWrite] = writesTo('books_invoice_lines');
		expect(lineWrite.row).toEqual([
			{ organisation_id: organisationId, invoice_id: draftId, description: 'Website build', quantity: 2, unit_price: 500, income_account_id: salesId, cost_centre_id: null, position: 0 },
			{ organisation_id: organisationId, invoice_id: draftId, description: 'Hosting', quantity: 1, unit_price: 20.5, income_account_id: salesId, cost_centre_id: projectsId, position: 1 }
		]);
		expect(writesTo('books_settings')).toEqual([expect.objectContaining({ kind: 'update', row: expect.objectContaining({ next_invoice_number: 8 }) })]);
		expect(answer).toContain("Drafted in Jewel Enterprises's books; nothing is posted until it is issued.");
		expect(answer).toContain('To Jewel Bespoke Build');
		expect(answer).toContain('- Hosting: 1 × £20.50 = £20.50; income account 4000 Sales, cost centre Projects');
	});

	it('refuse a draft whose lines or customer the books cannot take, writing nothing', async () => {
		const draft = (fields: Record<string, unknown>) => run('create_invoice', { customerId, lines: [websiteBuild], ...fields });
		expect(await draft({ lines: [{ ...websiteBuild, incomeAccountId: bankId }] })).toContain(`Nothing was saved. The account ${bankId} is of type asset`);
		expect(await draft({ lines: [{ ...websiteBuild, quantity: 0 }] })).toBe('Nothing was saved. Line 1 quantity is above zero; 0 was given.');
		expect(await draft({ issueDate: '2026-11-10', dueDate: '2026-11-01' })).toContain('Nothing was saved. dueDate 2026-11-01 is before issueDate 2026-11-10');
		heldTables.books_customers = [{ id: customerId, is_archived: true }];
		expect(await draft({})).toContain('is archived, so no new invoice is raised to it');
		heldTables.books_customers = [];
		expect(await draft({})).toContain(`Nothing was saved. No customer ${customerId} is in this organisation's books`);
		expect(invoiceWrites).toEqual([]);
	});

	it('change only what was given of a draft, and put the lines given in place of the ones it held', async () => {
		expect(await run('update_draft_invoice', { invoiceId: draftId, notes: 'Thank you', lines: [websiteBuild] })).toContain('Saved. The draft now reads:');
		expect(writesTo('books_invoices')).toEqual([{ table: 'books_invoices', kind: 'update', row: { notes: 'Thank you' } }]);
		expect(writesTo('books_invoice_lines').map((write) => write.kind)).toEqual(['insert', 'delete']);
	});

	it('refuse to change an invoice that is no longer a draft', async () => {
		heldTables.books_invoices = [{ ...sixthInvoice, status: 'issued' }];
		expect(await run('update_draft_invoice', { invoiceId: draftId, notes: 'x' })).toBe('Nothing was saved. Invoice number 6 is issued, and only a draft can be changed.');
		expect(invoiceWrites).toEqual([]);
	});

	it('read one invoice in full, and list them with their totals', async () => {
		expect(await run('read_invoice', { invoiceId: draftId })).toContain(`Invoice INV-6, draft. Id ${draftId}`);
		expect(await run('read_invoice', { invoiceId: draftId })).toContain('- Old line: 1 × £10.00 = £10.00');
		expect(await run('list_invoices', {})).toContain('- INV-6 to Jewel Bespoke Build, draft, dated 1 Nov 2026, due 1 Dec 2026; Total £10.00, not owed until it is issued.');
		expect(await run('list_invoices', { status: 'sent' })).toBe('No reading was taken. status is one of draft, issued, paid, void; "sent" was given.');
	});
});
