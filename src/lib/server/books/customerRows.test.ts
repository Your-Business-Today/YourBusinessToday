import { describe, expect, it } from 'vitest';
import type { BillingSchedule } from './billingScheduleRecord';
import type { CustomerWithBalance } from './customerBalances';
import { customerRowsOf, scheduleRowOf } from './customerRows';
import type { InvoiceNamings } from './invoiceNamings';

const customerOf = (id: string, isArchived: boolean, owed: number): CustomerWithBalance => ({
	customer: { id, name: `Customer ${id}`, contactName: 'Jeremy', email: 'accounts@example.com', address: '', isArchived, clientId: null, billedOrganisationId: null },
	balance: { invoiceCount: 2, unpaidInvoiceCount: owed > 0 ? 1 : 0, owed }
});

const namings = { invoicePrefix: 'INV', customerNames: new Map([['jewel', 'Jewel Enterprises']]) } as unknown as InvoiceNamings;

const schedule: BillingSchedule = {
	id: 'retainer',
	customerId: 'jewel',
	title: 'Monthly retainer',
	frequency: 'monthly',
	nextInvoiceDate: '2026-12-01',
	covers: 'in_advance',
	paymentTermsDays: null,
	sendsByItself: true,
	notes: '',
	isPaused: false,
	endsOn: null,
	lines: [
		{ id: 'line-1', description: 'Retainer', quantity: 1, unitPrice: 1500, amount: 1500, incomeAccountId: 'sales', costCentreId: null },
		{ id: 'line-2', description: 'Discount', quantity: 1, unitPrice: -150, amount: -150, incomeAccountId: 'sales', costCentreId: null }
	]
};

describe('customerRowsOf', () => {
	it('lists every customer in use, and an archived one only while it still owes', () => {
		const rows = customerRowsOf([customerOf('in-use', false, 0), customerOf('archived-owing', true, 20), customerOf('archived-settled', true, 0)]);
		expect(rows.map((row) => row.id)).toEqual(['in-use', 'archived-owing']);
		expect(rows[1]).toEqual({ id: 'archived-owing', name: 'Customer archived-owing', contact: 'Jeremy', email: 'accounts@example.com', invoiceCount: 2, owed: 20 });
	});
});

describe('scheduleRowOf', () => {
	it('names the customer and says what the next invoice comes to, how often and when', () => {
		expect(scheduleRowOf(schedule, namings)).toEqual({
			id: 'retainer',
			customer: 'Jewel Enterprises',
			title: 'Monthly retainer',
			amount: 1350,
			howOften: 'Monthly',
			nextInvoice: '2026-12-01',
			isSentByItself: true,
			isPaused: false
		});
	});
});
