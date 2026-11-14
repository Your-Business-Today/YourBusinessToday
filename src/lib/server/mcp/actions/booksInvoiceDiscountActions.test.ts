import { beforeEach, describe, expect, it, vi } from 'vitest';
import { postInvoiceRefund } from '$lib/server/books/postInvoiceRefund';
import { ledgerTables } from './booksLedgerDatabase.fixture';
import {
	accountIdOfCode, customerId, heldInvoice, holdDraftInvoice, invoiceId, journalsOfKind, ledgerSupabase, organisationId, postedLines,
	projectsId, runOnTheLedger as run, salesId
} from './booksInvoicePostingWorld.fixture';
import type { SupabaseClient } from '@supabase/supabase-js';

vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Your Business Today' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['books'] }));

const subscription = { description: 'Monthly subscription', quantity: 1, unitPrice: 2350, incomeAccountId: salesId };
const discount = { description: 'Discount NIGEL', quantity: 1, unitPrice: -2000, incomeAccountId: salesId, costCentreId: projectsId };

/** INV-3's shape: a sale of £2,350.00 less an agreed £2,000.00, kept within Projects. */
function holdDiscountedDraft(): void {
	holdDraftInvoice();
	ledgerTables.books_invoice_lines = [
		{ id: 'line-1', invoice_id: invoiceId, description: subscription.description, quantity: 1, unit_price: 2350, income_account_id: salesId, cost_centre_id: null, position: 0 },
		{ id: 'line-2', invoice_id: invoiceId, description: discount.description, quantity: 1, unit_price: -2000, income_account_id: salesId, cost_centre_id: projectsId, position: 1 }
	];
}

describe('an invoice line that takes money off', () => {
	beforeEach(holdDiscountedDraft);

	it('is drafted and read back as it was agreed', async () => {
		const answer = await run('create_invoice', { customerId, lines: [subscription, discount] });
		expect(answer).toContain('1 × -£2,000.00 = -£2,000.00');
		expect(await run('read_invoice', { invoiceId })).toContain('1 × -£2,000.00 = -£2,000.00');
	});

	it('is refused when the lines would come to less than nothing, on a new draft and on a change to one', async () => {
		const tooMuchOff = { ...discount, unitPrice: -2350.01 };
		const refusal = 'The lines come to -£0.01; an invoice comes to nothing or more';
		expect(await run('create_invoice', { customerId, lines: [subscription, tooMuchOff] })).toContain(refusal);
		expect(await run('update_draft_invoice', { invoiceId, lines: [subscription, tooMuchOff] })).toContain(refusal);
	});

	it('posts as a debit when issued, trade debtors owing the total, and the invoice is paid by the total', async () => {
		await run('issue_invoice', { invoiceId });
		const [sale] = journalsOfKind('invoice');
		expect(postedLines(sale.id)).toEqual([
			{ accountId: accountIdOfCode('1100'), costCentreId: null, debit: 350, credit: 0 },
			{ accountId: salesId, costCentreId: null, debit: 0, credit: 2350 },
			{ accountId: salesId, costCentreId: projectsId, debit: 2000, credit: 0 }
		]);
		expect(await run('record_invoice_payment', { invoiceId, paidOn: '2026-11-20', amount: 350 })).toContain('nothing owed');
		expect(heldInvoice().status).toBe('paid');
	});

	it('is reversed with the sale when the invoice is voided', async () => {
		await run('issue_invoice', { invoiceId });
		await run('void_invoice', { invoiceId });
		const [reversal] = journalsOfKind('invoice_void');
		expect(postedLines(reversal.id)).toContainEqual({ accountId: salesId, costCentreId: projectsId, debit: 0, credit: 2000 });
	});

	it('takes back its share of a refund the other way, so the accounts end where the net sale put them', async () => {
		await run('issue_invoice', { invoiceId });
		await run('record_invoice_payment', { invoiceId, paidOn: '2026-11-20', amount: 350 });
		const refundId = await postInvoiceRefund(ledgerSupabase as unknown as SupabaseClient, organisationId, { invoiceId, amount: 35, refundedOn: '2026-11-25' });
		expect(postedLines(refundId)).toEqual([
			{ accountId: salesId, costCentreId: null, debit: 235, credit: 0 },
			{ accountId: salesId, costCentreId: projectsId, debit: 0, credit: 200 },
			{ accountId: accountIdOfCode('1200'), costCentreId: null, debit: 0, credit: 35 }
		]);
	});
});
