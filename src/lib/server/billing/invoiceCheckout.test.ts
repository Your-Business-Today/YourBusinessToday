import { describe, expect, it } from 'vitest';
import { openInvoiceCheckout } from './invoiceCheckout';
import type { BilledInvoice } from '$lib/data/billing/billedInvoice';
import { booksHolding, heldSession, stripeStandIn } from './invoiceCheckout.fixture';

const payer = { email: 'accounts@client.example', paidUrl: 'https://site.example/portal/billing?paid=i', cancelledUrl: 'https://site.example/portal/billing' };

const invoice: BilledInvoice = {
	id: 'invoice-7',
	organisationId: 'ybt-books',
	printedNumber: 'INV-7',
	status: 'issued',
	issueDate: '2026-11-10',
	dueDate: '2026-12-10',
	reference: '',
	lines: [],
	total: 1500,
	amountPaid: 250.5
};

describe('the pay link of an invoice', () => {
	it('opens a payment page for what the invoice still owes, in pence, and keeps it on the invoice', async () => {
		const stripe = stripeStandIn();
		const books = booksHolding(null);
		const opening = await openInvoiceCheckout(stripe.gateway, books.books, invoice, payer);
		expect(opening).toEqual({ url: 'https://checkout.stripe.example/1' });
		expect(stripe.orders[0]).toMatchObject({ invoiceId: 'invoice-7', organisationId: 'ybt-books', printedNumber: 'INV-7', amountPence: 124950 });
		expect(books.kept).toEqual(['cs_test_1']);
	});

	it('opens the same page again while it asks for the amount owed', async () => {
		const stripe = stripeStandIn([heldSession('open', 124950)]);
		const opening = await openInvoiceCheckout(stripe.gateway, booksHolding('cs_test_held').books, invoice, payer);
		expect(opening).toEqual({ url: 'https://checkout.stripe.example/held' });
		expect(stripe.orders).toEqual([]);
	});

	it('expires a page asking for an amount since changed before opening one for the amount owed', async () => {
		const stripe = stripeStandIn([heldSession('open', 150000)]);
		const books = booksHolding('cs_test_held');
		await openInvoiceCheckout(stripe.gateway, books.books, invoice, payer);
		expect(stripe.expired).toEqual(['cs_test_held']);
		expect(books.kept).toEqual(['cs_test_1']);
	});

	it('opens a new page when the one before has expired', async () => {
		const stripe = stripeStandIn([heldSession('expired', 124950)]);
		const opening = await openInvoiceCheckout(stripe.gateway, booksHolding('cs_test_held').books, invoice, payer);
		expect(opening).toEqual({ url: 'https://checkout.stripe.example/1' });
		expect(stripe.expired).toEqual([]);
	});

	it('opens no second page once the first has been paid', async () => {
		const stripe = stripeStandIn([heldSession('complete', 124950)]);
		const opening = await openInvoiceCheckout(stripe.gateway, booksHolding('cs_test_held').books, invoice, payer);
		expect(opening).toMatchObject({ refusal: expect.stringMatching(/has been paid/) });
		expect(stripe.orders).toEqual([]);
	});

	it('expires its own page when another press kept one first, so only one can be paid', async () => {
		const stripe = stripeStandIn();
		const opening = await openInvoiceCheckout(stripe.gateway, booksHolding(null, true).books, invoice, payer);
		expect(opening).toMatchObject({ refusal: expect.stringMatching(/opened a moment ago/) });
		expect(stripe.expired).toEqual(['cs_test_1']);
	});

	it('opens nothing for an invoice that is paid, cancelled or owes nothing', async () => {
		const stripe = stripeStandIn();
		const settled = [{ ...invoice, status: 'paid' as const }, { ...invoice, status: 'void' as const }, { ...invoice, amountPaid: 1500 }];
		for (const each of settled) {
			const opening = await openInvoiceCheckout(stripe.gateway, booksHolding(null).books, each, payer);
			expect(opening).toMatchObject({ refusal: expect.stringMatching(/nothing left to pay/) });
		}
		expect(stripe.orders).toEqual([]);
	});
});
