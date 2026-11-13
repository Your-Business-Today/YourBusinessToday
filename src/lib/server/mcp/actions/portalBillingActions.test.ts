import { beforeEach, describe, expect, it, vi } from 'vitest';
import { noInvoicesYet } from './describeMyInvoices';
import { notYourInvoice, payingNotOpen } from '$lib/server/billing/payingAnInvoice';
import { portalBillingActions } from './portalBillingActions';
import type { McpCaller } from '../resolveMcpCaller';

const acmeId = '11111111-1111-4111-8111-111111111111';
const invoiceId = '55555555-5555-4555-8555-555555555555';
const contact = { accountId: 'contact-1', supabase: {} } as unknown as McpCaller;

const { portal, billing, opening } = vi.hoisted(() => ({
	portal: { visitor: null as Record<string, unknown> | null },
	billing: { invoices: [] as unknown[], isOpen: true },
	opening: vi.fn()
}));

vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$lib/server/portal/getPortalVisitor', () => ({ getPortalVisitor: async () => portal.visitor }));
vi.mock('$lib/server/billing/billedInvoices', () => ({
	findBilledInvoices: async () => billing.invoices,
	findBilledInvoice: async (_service: unknown, _clientId: string, id: string) => billing.invoices.find((invoice) => (invoice as { id: string }).id === id) ?? null
}));
vi.mock('$lib/server/billing/stripeSecretKey', () => ({ isStripeCheckoutOpen: () => billing.isOpen }));
vi.mock('$lib/server/billing/stripeCheckoutGateway', () => ({ stripeCheckoutGateway: () => (billing.isOpen ? {} : null) }));
vi.mock('$lib/server/billing/invoiceCheckoutSessions', () => ({ booksCheckoutSessions: () => ({}) }));
vi.mock('$lib/server/billing/invoiceCheckout', () => ({ openInvoiceCheckout: opening }));

const visitor = {
	contactId: 'contact-row-1', isAdministrator: false, personName: 'Dana', emailAddress: 'dana@acme.example', role: 'Director',
	clientId: acmeId, organisationName: 'Acme Ltd', organisations: [{ clientId: acmeId, name: 'Acme Ltd' }]
};
const discoveryLine = { id: 'line-1', description: 'Discovery stage', quantity: 2, unitPrice: 750, amount: 1500 };
const unpaid = {
	id: invoiceId, organisationId: 'ybt', printedNumber: 'INV-0012', status: 'issued', issueDate: '2026-11-03', dueDate: '2026-11-17',
	reference: 'Discovery', lines: [discoveryLine], total: 1500, amountPaid: 500
};
const payer = {
	email: 'dana@acme.example',
	paidUrl: `https://portal.yourbusiness.today/portal/billing?paid=${invoiceId}`,
	cancelledUrl: 'https://portal.yourbusiness.today/portal/billing'
};

function run(name: string, input: Record<string, unknown> = {}) {
	const action = portalBillingActions.find((candidate) => candidate.name === name);
	if (action === undefined) throw new Error(`No action named ${name}`);
	return action.run(contact, input);
}

describe("a client contact's invoices through the connector", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		portal.visitor = visitor;
		billing.invoices = [unpaid];
		billing.isOpen = true;
		opening.mockResolvedValue({ url: 'https://checkout.stripe.example/session' });
	});

	it('lists each invoice as the Billing section shows it, with its lines', async () => {
		expect(await run('list_my_invoices')).toBe(
			[
				`For Acme Ltd (clientId ${acmeId}).`,
				'',
				'An unpaid invoice is paid by card with pay_invoice.',
				'',
				`Invoice INV-0012 — Unpaid — issued 3 Nov 2026 — due 17 Nov 2026 — reference Discovery — paid so far £500.00 — to pay £1,000.00 — total £1,500.00 — invoice ${invoiceId}`,
				'  Discovery stage — 2 at £750.00 — £1,500.00'
			].join('\n')
		);
		billing.invoices = [];
		expect(await run('list_my_invoices')).toContain(noInvoicesYet);
	});

	it('opens the payment page for what the invoice still owes and gives its link', async () => {
		expect(await run('pay_invoice', { invoiceId })).toBe(
			'Invoice INV-0012 owes £1,000.00. Pay it at https://checkout.stripe.example/session — the page is Stripe\'s, and the Billing section shows it paid once the payment is recorded.'
		);
		expect(opening).toHaveBeenCalledWith(expect.anything(), expect.anything(), unpaid, payer);
	});

	it('says when paying is not open, when the invoice is not theirs, and what the checkout refuses', async () => {
		expect(await run('pay_invoice', { invoiceId: 'twelve' })).toContain('invoiceId');
		expect(await run('pay_invoice', { invoiceId: '66666666-6666-4666-8666-666666666666' })).toBe(notYourInvoice);
		opening.mockResolvedValue({ refusal: 'This invoice has nothing left to pay.' });
		expect(await run('pay_invoice', { invoiceId })).toBe('This invoice has nothing left to pay.');
		billing.isOpen = false;
		expect(await run('pay_invoice', { invoiceId })).toBe(payingNotOpen);
		expect(await run('list_my_invoices')).toContain('Paying by card is not open yet.');
	});
});
