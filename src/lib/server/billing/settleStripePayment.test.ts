import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readStripeNotice, type StripeEventDelivery, type StripeNotice } from '$lib/data/billing/stripeNotice';
import { ledgerDatabase } from '$lib/server/mcp/actions/booksLedgerDatabase.fixture';
import {
	heldInvoice,
	holdDraftInvoice,
	invoiceId,
	journalsOfKind,
	organisationId,
	runOnTheLedger
} from '$lib/server/mcp/actions/booksInvoicePostingWorld.fixture';
import { receiveStripeNotice } from './receiveStripeNotice';
import { stripeBooksPoster } from './stripeBooksPoster';
import { stripeEventBookStandIn } from './stripeEventBook.fixture';
import { paidCheckout } from './stripeDeliveries.fixture';
import type { SupabaseClient } from '@supabase/supabase-js';

vi.mock('$lib/server/organisations/getOrganisation', () => ({ getOrganisation: async (_supabase: unknown, id: string) => ({ id, name: 'YBT' }) }));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['books'] }));

const theInvoice = { invoiceId, organisationId };
const wholeInvoicePence = 102050;
let events = stripeEventBookStandIn();
const poster = stripeBooksPoster(ledgerDatabase as unknown as SupabaseClient);
const receive = (delivery: StripeEventDelivery) => receiveStripeNotice(events.book, poster, readStripeNotice(delivery) as StripeNotice);

describe('a payment made through Stripe that the books cannot post', () => {
	beforeEach(async () => {
		holdDraftInvoice();
		await runOnTheLedger('issue_invoice', { invoiceId });
		events = stripeEventBookStandIn();
	});

	it('keeps a payment naming no invoice as unmatched, for an administrator, and posts nothing', async () => {
		expect(await receive(paidCheckout('evt_stray', null, 5000))).toEqual({
			outcome: 'unmatched'
		});
		expect(events.kept).toEqual([
			expect.objectContaining({
				outcome: 'unmatched',
				amountPence: 5000,
				payerEmail: 'accounts@jewel.example',
				reason: "Checkout cs_test_paid names no invoice in Your Business Today's books."
			})
		]);
		expect(journalsOfKind('invoice_payment')).toEqual([]);
	});

	it('keeps a payment the invoice cannot take as unmatched, with the reason the books gave', async () => {
		expect(await receive(paidCheckout('evt_too_much', theInvoice, wholeInvoicePence + 100))).toEqual({ outcome: 'unmatched' });
		const [kept] = events.kept;
		expect(kept.reason).toBe(
			'Checkout cs_test_paid paid, but the books refused it: Invoice INV-6 owes £1,020.50, and £1,021.50 is more than that.'
		);
		expect(heldInvoice().status).toBe('issued');
	});
});
