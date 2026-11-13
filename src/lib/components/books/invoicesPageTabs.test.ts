import { describe, expect, it } from 'vitest';
import type { InvoicesPage } from '$lib/data/books/page/invoicesPage';
import type { InvoiceRow } from '$lib/data/books/page/invoiceRows';
import { invoicesPageTabsOf, isInvoiceTab } from './invoicesPageTabs';
import { invoiceRowStatusOf } from './invoiceRowStatus';

const invoiceOf = (id: string, status: InvoiceRow['status'], daysOverdue: number | null = null): InvoiceRow => ({
	id,
	number: 'INV-1',
	invoiceNumber: 1,
	customer: 'Jewel Enterprises',
	dated: '2026-10-01',
	due: '2026-10-31',
	total: 100,
	owed: 0,
	status,
	daysOverdue,
	sentAt: null
});

const customer = { id: 'jewel', name: 'Jewel Enterprises', contact: 'Jeremy', email: 'accounts@example.com', invoiceCount: 3, owed: 100 };

const page: InvoicesPage = {
	invoices: [invoiceOf('a', 'issued'), invoiceOf('b', 'issued'), invoiceOf('c', 'paid'), invoiceOf('d', 'draft')],
	customers: [customer],
	schedules: []
};

describe('invoicesPageTabsOf', () => {
	it('counts each status, sets Customers and Schedules apart after Void, and counts none on an empty tab', () => {
		expect(invoicesPageTabsOf(page)).toEqual([
			{ key: 'all', label: 'All', count: 4, isSetApart: false },
			{ key: 'draft', label: 'Draft', count: 1, isSetApart: false },
			{ key: 'unpaid', label: 'Unpaid', count: 2, isSetApart: false },
			{ key: 'paid', label: 'Paid', count: 1, isSetApart: false },
			{ key: 'void', label: 'Void', count: null, isSetApart: true },
			{ key: 'customers', label: 'Customers', count: 1 },
			{ key: 'schedules', label: 'Schedules', count: null }
		]);
	});
});

describe('isInvoiceTab', () => {
	it('tells the invoice tabs from Customers and Schedules', () => {
		expect(isInvoiceTab('void')).toBe(true);
		expect(isInvoiceTab('customers')).toBe(false);
	});
});

describe('invoiceRowStatusOf', () => {
	it('shows the status, or the days overdue in red on an overdue invoice', () => {
		expect(invoiceRowStatusOf(invoiceOf('a', 'paid'))).toEqual({ label: 'Paid', tone: 'positive' });
		expect(invoiceRowStatusOf(invoiceOf('b', 'issued', 1))).toEqual({ label: 'Overdue 1 day', tone: 'negative' });
		expect(invoiceRowStatusOf(invoiceOf('c', 'issued', 12))).toEqual({ label: 'Overdue 12 days', tone: 'negative' });
	});
});
