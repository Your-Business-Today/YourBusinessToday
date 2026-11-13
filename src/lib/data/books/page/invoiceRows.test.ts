import { describe, expect, it } from 'vitest';
import { describeOwedByCustomers, invoicesOnTab, type InvoiceRow } from './invoiceRows';

const invoiceOf = (invoiceNumber: number, status: InvoiceRow['status'], owed: number, daysOverdue: number | null): InvoiceRow => ({
	id: `invoice-${invoiceNumber}`,
	number: `INV-${invoiceNumber}`,
	invoiceNumber,
	customer: 'Jewel Enterprises',
	dated: '2026-10-01',
	due: '2026-10-31',
	total: 1500,
	owed,
	status,
	daysOverdue,
	sentAt: null
});

const draft = invoiceOf(6, 'draft', 0, null);
const dueLater = invoiceOf(5, 'issued', 1500, null);
const overdueAWeek = invoiceOf(4, 'issued', 250.5, 7);
const overdueAMonth = invoiceOf(3, 'issued', 1000, 30);
const paid = invoiceOf(2, 'paid', 0, null);
const voided = invoiceOf(1, 'void', 0, null);
const invoices = [draft, dueLater, overdueAWeek, overdueAMonth, paid, voided];

describe('invoicesOnTab', () => {
	it('lists each status on its own tab and every invoice on All, newest number first', () => {
		expect(invoicesOnTab(invoices, 'all')).toEqual(invoices);
		expect(invoicesOnTab(invoices, 'draft')).toEqual([draft]);
		expect(invoicesOnTab(invoices, 'paid')).toEqual([paid]);
		expect(invoicesOnTab(invoices, 'void')).toEqual([voided]);
	});

	it('lists the longest overdue first on Unpaid, then those not yet due', () => {
		expect(invoicesOnTab(invoices, 'unpaid')).toEqual([overdueAMonth, overdueAWeek, dueLater]);
	});
});

describe('describeOwedByCustomers', () => {
	it('sums what the unpaid invoices owe and how much of it is overdue', () => {
		expect(describeOwedByCustomers(invoices)).toBe('£2,750.50 is owed by customers, across 3 unpaid invoices, £1,250.50 of it overdue.');
	});

	it('names a single unpaid invoice as one and says nothing of overdue when none is', () => {
		expect(describeOwedByCustomers([dueLater, paid])).toBe('£1,500.00 is owed by customers, across one unpaid invoice.');
	});

	it('says nothing is owed when no invoice is unpaid', () => {
		expect(describeOwedByCustomers([draft, paid, voided])).toBe('Nothing is owed by customers.');
	});
});
