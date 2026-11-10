import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readStripeNotice, type StripeEventDelivery, type StripeNotice } from '$lib/data/billing/stripeNotice';
import { ledgerDatabase, ledgerTables } from '$lib/server/mcp/actions/booksLedgerDatabase.fixture';
import {
	accountIdOfCode,
	heldInvoice,
	holdDraftInvoice,
	invoiceId,
	journalsOfKind,
	organisationId,
	postedLines,
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

describe('a payment made through Stripe', () => {
	beforeEach(async () => {
		holdDraftInvoice();
		await runOnTheLedger('issue_invoice', { invoiceId });
		events = stripeEventBookStandIn();
	});

	it('posts into the bank and off trade debtors on the day it was paid, and marks the invoice paid', async () => {
		expect(await receive(paidCheckout('evt_paid', theInvoice, wholeInvoicePence))).toEqual({ outcome: 'posted' });
		const [payment] = journalsOfKind('invoice_payment');
		expect(payment).toEqual(
			expect.objectContaining({
				journal_date: '2026-11-20',
				description: 'Payment for invoice INV-6 from Jewel Bespoke Build'
			})
		);
		expect(postedLines(payment.id)).toEqual([
			{
				accountId: accountIdOfCode('1200'),
				costCentreId: null,
				debit: 1020.5,
				credit: 0
			},
			{
				accountId: accountIdOfCode('1100'),
				costCentreId: null,
				debit: 0,
				credit: 1020.5
			}
		]);
		expect(heldInvoice().status).toBe('paid');
		expect(events.kept).toEqual([
			expect.objectContaining({
				eventId: 'evt_paid',
				outcome: 'posted',
				invoiceId,
				journalId: payment.id,
				amountPence: wholeInvoicePence
			})
		]);
	});

	it('posts once when Stripe sends the same event twice, or a second event for the same payment', async () => {
		await receive(paidCheckout('evt_paid', theInvoice, wholeInvoicePence));
		expect(await receive(paidCheckout('evt_paid', theInvoice, wholeInvoicePence))).toEqual({ outcome: 'already_received' });
		expect(await receive(paidCheckout('evt_paid_again', theInvoice, wholeInvoicePence))).toEqual({ outcome: 'ignored' });
		expect(journalsOfKind('invoice_payment')).toHaveLength(1);
		expect(ledgerTables.books_invoice_payments).toHaveLength(1);
	});

	it('keeps an event whose posting stopped on an error as failed, and posts it when Stripe sends it again', async () => {
		const failingPoster = {
			...poster,
			recordPayment: async () => Promise.reject(new Error('connection lost'))
		};
		const notice = readStripeNotice(paidCheckout('evt_paid', theInvoice, wholeInvoicePence)) as StripeNotice;
		await expect(receiveStripeNotice(events.book, failingPoster, notice)).rejects.toThrow('connection lost');
		expect(events.kept).toEqual([
			expect.objectContaining({
				outcome: 'failed',
				amountPence: wholeInvoicePence
			})
		]);
		expect(await receive(paidCheckout('evt_paid', theInvoice, wholeInvoicePence))).toEqual({ outcome: 'posted' });
		expect(journalsOfKind('invoice_payment')).toHaveLength(1);
	});
});
