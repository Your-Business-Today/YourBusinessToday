import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readStripeNotice, type StripeEventDelivery, type StripeNotice } from '$lib/data/billing/stripeNotice';
import { ledgerDatabase } from '$lib/server/mcp/actions/booksLedgerDatabase.fixture';
import {
	accountIdOfCode,
	heldInvoice,
	holdDraftInvoice,
	invoiceId,
	journalsOfKind,
	organisationId,
	postedLines,
	projectsId,
	runOnTheLedger,
	salesId
} from '$lib/server/mcp/actions/booksInvoicePostingWorld.fixture';
import { receiveStripeNotice } from './receiveStripeNotice';
import { stripeBooksPoster } from './stripeBooksPoster';
import { stripeEventBookStandIn } from './stripeEventBook.fixture';
import { paidCheckout, refundedCharge } from './stripeDeliveries.fixture';
import type { SupabaseClient } from '@supabase/supabase-js';

vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Your Business Today' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['books'] }));

let events = stripeEventBookStandIn();
const poster = stripeBooksPoster(ledgerDatabase as unknown as SupabaseClient);
const receive = (delivery: StripeEventDelivery) => receiveStripeNotice(events.book, poster, readStripeNotice(delivery) as StripeNotice);

describe('a refund made through Stripe', () => {
	beforeEach(async () => {
		holdDraftInvoice();
		await runOnTheLedger('issue_invoice', { invoiceId });
		events = stripeEventBookStandIn();
		await receive(paidCheckout('evt_paid', { invoiceId, organisationId }, 102050));
	});

	it('posts its own entry: out of the bank, and the sale taken back off its income lines in proportion', async () => {
		expect(await receive(refundedCharge('evt_refund_1', 'pi_test_paid', 10205))).toEqual({ outcome: 'posted' });
		const [refund] = journalsOfKind('invoice_refund');
		expect(refund).toEqual(
			expect.objectContaining({ journal_date: '2026-11-20', description: 'Refund on invoice INV-6 to Jewel Bespoke Build' })
		);
		expect(postedLines(refund.id)).toEqual([
			{ accountId: salesId, costCentreId: null, debit: 100, credit: 0 },
			{ accountId: salesId, costCentreId: projectsId, debit: 2.05, credit: 0 },
			{ accountId: accountIdOfCode('1200'), costCentreId: null, debit: 0, credit: 102.05 }
		]);
		expect(heldInvoice().status).toBe('paid');
	});

	it('posts only what is refunded beyond the refunds already posted, and nothing for the same total again', async () => {
		await receive(refundedCharge('evt_refund_1', 'pi_test_paid', 10205));
		expect(await receive(refundedCharge('evt_refund_2', 'pi_test_paid', 30000))).toEqual({ outcome: 'posted' });
		expect(await receive(refundedCharge('evt_refund_3', 'pi_test_paid', 30000))).toEqual({ outcome: 'ignored' });
		const [, second] = journalsOfKind('invoice_refund');
		expect(postedLines(second.id).at(-1)).toEqual({ accountId: accountIdOfCode('1200'), costCentreId: null, debit: 0, credit: 197.95 });
		expect(journalsOfKind('invoice_refund')).toHaveLength(2);
	});

	it('keeps a refund on a payment the books never posted as unmatched, and posts nothing', async () => {
		expect(await receive(refundedCharge('evt_refund_stray', 'pi_test_other', 5000))).toEqual({ outcome: 'unmatched' });
		expect(events.kept.at(-1)?.reason).toBe('Charge ch_test_paid was refunded, but the books never posted its payment.');
		expect(journalsOfKind('invoice_refund')).toEqual([]);
	});
});
