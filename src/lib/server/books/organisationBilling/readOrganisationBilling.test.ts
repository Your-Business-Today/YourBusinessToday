import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ledgerTables } from '$lib/server/mcp/actions/booksLedgerDatabase.fixture';
import { today } from '$lib/server/mcp/actions/booksBillingScheduleWorld.fixture';
import { readOrganisationBilling } from './readOrganisationBilling';
import { setUpOrganisationBilling } from './organisationBillingWrites';
import { billingService, clientOrganisation, clientOrganisationId, heldCustomers, holdBooksAndClient, monthlyFees, ownBooksId, ownOrganisation } from './organisationBillingWorld.fixture';

const service = billingService as unknown as SupabaseClient;

const read = async () => (await readOrganisationBilling(service, clientOrganisationId))!;

describe("the Billing tab's reading", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(today);
		holdBooksAndClient();
	});

	afterEach(() => vi.useRealTimers());

	it('reads nothing billed yet, and offers the income accounts and cost centres', async () => {
		const billing = await read();
		expect(billing.schedules).toEqual([]);
		expect(billing.invoices).toEqual([]);
		expect(billing.incomeAccounts).toEqual([{ id: expect.any(String), label: '4000 Fees' }]);
		expect(billing.costCentres).toEqual([{ id: expect.any(String), label: 'Projects' }]);
		expect(billing.today).toBe('2026-11-13');
	});

	it('is absent on Your Business Today itself', async () => {
		expect(await readOrganisationBilling(service, ownBooksId)).toBeNull();
		await expect(setUpOrganisationBilling(service, ownOrganisation, monthlyFees)).rejects.toThrow('does not bill itself');
	});

	it('lists the invoices raised to the organisation, whether each was sent, opening as its document', async () => {
		await setUpOrganisationBilling(service, clientOrganisation, monthlyFees);
		const customerId = heldCustomers().find((row) => row.billed_organisation_id === clientOrganisationId)!.id;
		const invoiceId = '00000000-0000-4000-8000-000000000f07';
		ledgerTables.books_invoices = [
			{ id: invoiceId, customer_id: customerId, invoice_number: 7, status: 'issued', issue_date: '2026-11-01', due_date: '2026-11-15', reference: 'Monthly fees: November 2026', notes: '' }
		];
		ledgerTables.books_invoice_lines = [{ id: 'l1', invoice_id: invoiceId, quantity: 1, unit_price: 5100 }];
		ledgerTables.books_invoice_sendings = [{ id: 's1', invoice_id: invoiceId, sent_to: 'accounts@prentice.example', delivery: 'sent', sent_by: null, sent_at: '2026-11-01T07:00:00Z' }];
		const [invoice] = (await read()).invoices;
		expect(invoice).toMatchObject({ printedNumber: 'INV-7', reference: 'Monthly fees: November 2026', total: 5100, status: 'issued', isSent: true });
		expect(invoice.documentHref).toBe(`/organisations/${ownBooksId}/books/invoices/${invoiceId}`);
	});

});
