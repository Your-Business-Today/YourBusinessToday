import { ledgerTables } from '$lib/server/mcp/actions/booksLedgerDatabase.fixture';
import { feesId, holdBooksWithoutSchedules, organisationId as ownBooksId } from '$lib/server/mcp/actions/booksBillingScheduleWorld.fixture';
import { parseOrganisationRecord } from '$lib/server/organisations/organisationRecord';

export { scheduleSupabase as billingService } from '$lib/server/mcp/actions/booksBillingScheduleWorld.fixture';
export { feesId, ownBooksId };

export const clientOrganisationId = '00000000-0000-4000-8000-0000000b1110';

const clientRow = {
	id: clientOrganisationId,
	name: 'Prentice',
	legal_name: 'Prentice Glass Ltd',
	address: '1 High Street',
	accounts_contact_name: 'Jo Prentice',
	accounts_contact_email: 'accounts@prentice.example',
	parent_organisation_id: null,
	created_at: '2026-11-01T09:00:00Z'
};

const ownRow = { id: ownBooksId, name: 'Your Business Today', parent_organisation_id: null, created_at: '2026-07-09T09:00:00Z' };

export const clientOrganisation = parseOrganisationRecord(clientRow);

export const ownOrganisation = parseOrganisationRecord(ownRow);

/** The seven lines Prentice Glass is billed each month, coming to £5,100.00, as the form posts them. */
export const sevenLines = [
	{ description: 'Portal hosting', quantity: '1', unitPrice: '1500.00' },
	{ description: 'Support', quantity: '1', unitPrice: '1000.00' },
	{ description: 'Brain', quantity: '1', unitPrice: '800.00' },
	{ description: 'Books', quantity: '1', unitPrice: '600.00' },
	{ description: 'Brand', quantity: '1', unitPrice: '500.00' },
	{ description: 'Sales', quantity: '2', unitPrice: '400.00' },
	{ description: 'Loyalty discount', quantity: '1', unitPrice: '-100.00' }
].map((line) => ({ ...line, incomeAccountId: feesId, costCentreId: null }));

/** What the form posts for a monthly schedule in advance from 1 December 2026, with 14 days to pay, sending by itself. */
export const monthlyFees = {
	title: 'Monthly fees',
	frequency: 'monthly',
	nextInvoiceDate: '2026-12-01',
	covers: 'in_advance',
	paymentTermsDays: 14,
	sendsByItself: true,
	notes: '',
	endsOn: null,
	lines: sevenLines
};

/** Your Business Today's own books, with Prentice Glass on the site and not yet a customer, and no invoices raised. */
export function holdBooksAndClient(): void {
	holdBooksWithoutSchedules();
	for (const customer of ledgerTables.books_customers) customer.billed_organisation_id = null;
	ledgerTables.organisations = [ownRow, clientRow];
	ledgerTables.books_invoices = [];
	ledgerTables.books_invoice_lines = [];
	ledgerTables.books_invoice_payments = [];
	ledgerTables.books_invoice_sendings = [];
}

export function heldCustomers(): Record<string, unknown>[] {
	return ledgerTables.books_customers;
}
