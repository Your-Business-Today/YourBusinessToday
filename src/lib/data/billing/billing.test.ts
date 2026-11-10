import { describe, expect, it } from 'vitest';
import { amountOwedOn, billingStandingOf, isBilled, isPayable, type BilledInvoice } from './billedInvoice';
import { checkoutSessionIdRules, validateCheckoutSessionId } from './checkoutSessionRules';
import type { InvoiceStatus } from '$lib/data/books/invoiceStatuses';

function invoiceOf(status: InvoiceStatus, total: number, amountPaid: number): BilledInvoice {
	return {
		id: 'invoice',
		organisationId: 'books',
		printedNumber: 'INV-7',
		status,
		issueDate: '2026-11-10',
		dueDate: '2026-12-10',
		reference: '',
		lines: [],
		total,
		amountPaid
	};
}

describe('what a client sees of an invoice', () => {
	it('bills an issued, paid or void invoice and never a draft', () => {
		expect(isBilled('draft')).toBe(false);
		expect(['issued', 'paid', 'void'].every((status) => isBilled(status as InvoiceStatus))).toBe(true);
	});

	it('shows an issued invoice as unpaid, a paid one as paid and a void one as cancelled', () => {
		expect(billingStandingOf(invoiceOf('issued', 100, 0))).toBe('unpaid');
		expect(billingStandingOf(invoiceOf('paid', 100, 100))).toBe('paid');
		expect(billingStandingOf(invoiceOf('void', 100, 0))).toBe('cancelled');
	});

	it('owes the total less what has been paid, to the penny', () => {
		expect(amountOwedOn(invoiceOf('issued', 120.1, 20.05))).toBe(100.05);
	});

	it('offers to pay only an issued invoice that still owes something', () => {
		expect(isPayable(invoiceOf('issued', 100, 40))).toBe(true);
		expect(isPayable(invoiceOf('issued', 100, 100))).toBe(false);
		expect(isPayable(invoiceOf('paid', 100, 100))).toBe(false);
		expect(isPayable(invoiceOf('void', 100, 0))).toBe(false);
	});
});

describe('the Stripe Checkout session an invoice keeps', () => {
	it('takes an id Stripe gives', () => {
		expect(validateCheckoutSessionId('cs_test_a1B2c3')).toBeNull();
	});

	it('refuses anything that is not a Checkout session id, or longer than its column', () => {
		expect(validateCheckoutSessionId('pi_123')).toMatch(/must start cs_/);
		expect(validateCheckoutSessionId('cs_')).toMatch(/must start cs_/);
		const tooLong = `cs_${'a'.repeat(checkoutSessionIdRules.maximumLength)}`;
		expect(validateCheckoutSessionId(tooLong)).toMatch(/at most 255/);
	});
});
