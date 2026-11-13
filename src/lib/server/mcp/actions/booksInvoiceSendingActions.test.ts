import { beforeEach, describe, expect, it, vi } from 'vitest';
import { blankOrganisationDetails } from '$lib/data/organisationRules';
import type { TransactionalEmail } from '$lib/server/email/sendTransactionalEmail';
import { ledgerTables } from './booksLedgerDatabase.fixture';
import { nigelAccountId } from './booksLedgerCalls.fixture';
import { heldInvoice, holdDraftInvoice, invoiceId, runOnTheLedger as run } from './booksInvoicePostingWorld.fixture';

const outbox = vi.hoisted(() => ({ emails: [] as TransactionalEmail[], delivery: 'sent' as 'sent' | 'skipped' | 'failed' }));
vi.mock('$lib/server/email/sendTransactionalEmail', () => ({
	sendTransactionalEmail: async (email: TransactionalEmail) => (outbox.emails.push(email), outbox.delivery)
}));
vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ ...blankOrganisationDetails, id, parentOrganisationId: null, name: 'Jewel Enterprises' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['books'] }));

const companyEmail = 'accounts@jewel.example';

function holdIssuedInvoice(customerEmail: string): void {
	holdDraftInvoice();
	heldInvoice().status = 'issued';
	ledgerTables.books_customers[0].email = customerEmail;
	ledgerTables.books_settings = [
		{ invoice_prefix: 'INV', company_name: 'Jewel Enterprises Ltd', company_email: companyEmail, bank_sort_code: '12-34-56', bank_account_number: '12345678' }
	];
}

const sendings = () => ledgerTables.books_invoice_sendings ?? [];

describe('send_invoice', () => {
	beforeEach(() => {
		outbox.emails = [];
		outbox.delivery = 'sent';
		holdIssuedInvoice('ap@bespoke.example');
	});

	it("emails an issued invoice to the customer's address, with replies and a copy going to the books' company email", async () => {
		const answer = await run('send_invoice', { invoiceId });
		expect(answer).toContain(`Sent invoice INV-6 to ap@bespoke.example; a copy went to ${companyEmail}, where replies go.`);
		const [email] = outbox.emails;
		expect(email).toEqual(expect.objectContaining({ to: 'ap@bespoke.example', replyTo: companyEmail, bcc: companyEmail }));
		expect(email.subject).toBe('Invoice INV-6 from Jewel Enterprises Ltd: £1,020.50 due 1 December 2026');
		for (const shown of ['Website build', 'Hosting', '£1,020.50', '12-34-56', '12345678']) expect(email.html).toContain(shown);
		expect(sendings()).toEqual([expect.objectContaining({ invoice_id: invoiceId, sent_to: 'ap@bespoke.example', delivery: 'sent', sent_by: nigelAccountId })]);
	});

	it('sends to the address given in place of the customer, keeps every sending, and lists them on read_invoice', async () => {
		await run('send_invoice', { invoiceId });
		await run('send_invoice', { invoiceId, to: 'finance@bespoke.example' });
		expect(sendings().map((sending) => sending.sent_to)).toEqual(['ap@bespoke.example', 'finance@bespoke.example']);
		const reading = await run('read_invoice', { invoiceId });
		expect(reading).toContain('Emailed:');
		expect(reading).toContain('to finance@bespoke.example: sent');
	});

	it('keeps a failed sending and says so', async () => {
		outbox.delivery = 'failed';
		expect(await run('send_invoice', { invoiceId })).toContain('could not be sent; the attempt is kept as failed');
		expect(sendings()).toEqual([expect.objectContaining({ delivery: 'failed' })]);
	});

	it('refuses a draft, a void invoice, an invoice with nowhere to go and an address that is not one, sending nothing', async () => {
		heldInvoice().status = 'draft';
		const draftRefusal = 'Nothing was sent. Invoice INV-6 is draft, and only an issued or paid invoice is emailed to its customer.';
		expect(await run('send_invoice', { invoiceId })).toBe(draftRefusal);
		heldInvoice().status = 'void';
		expect(await run('send_invoice', { invoiceId })).toContain('Invoice INV-6 is void');
		heldInvoice().status = 'issued';
		ledgerTables.books_customers[0].email = '';
		expect(await run('send_invoice', { invoiceId })).toContain('Nothing was sent. Invoice INV-6 has nowhere to go: Jewel Bespoke Build has no email');
		expect(await run('send_invoice', { invoiceId, to: 'not an address' })).toContain('Nothing was sent. to is the address to send the invoice to');
		expect(await run('send_invoice', { invoiceId, to: `${'a'.repeat(250)}@b.co` })).toContain('to is at most 254 characters');
		expect(outbox.emails).toEqual([]);
		expect(sendings()).toEqual([]);
	});

	it('links the invoice in the portal only when the customer is a client on the register', async () => {
		await run('send_invoice', { invoiceId });
		expect(outbox.emails[0].html).not.toContain('/portal/billing/invoices/');
		ledgerTables.books_customers[0].client_id = '00000000-0000-4000-8000-0000000c1e01';
		await run('send_invoice', { invoiceId });
		expect(outbox.emails[1].html).toContain(`/portal/billing/invoices/${invoiceId}`);
	});

	it('marks an issued invoice never emailed in list_invoices, until it is sent', async () => {
		expect(await run('list_invoices', {})).toContain('issued but never emailed');
		outbox.delivery = 'skipped';
		await run('send_invoice', { invoiceId });
		expect(await run('list_invoices', {})).toContain('issued but never emailed');
		outbox.delivery = 'sent';
		await run('send_invoice', { invoiceId });
		expect(await run('list_invoices', {})).not.toContain('issued but never emailed');
	});
});
