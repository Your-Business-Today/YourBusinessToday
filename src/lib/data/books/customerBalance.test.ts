import { describe, expect, it } from 'vitest';
import { balanceOf, balancesOfCustomers, invoiceLineTotal } from './customerBalance';
import { InvoiceStatuses } from './invoiceStatuses';

const shop = 'shop';

describe('a customer balance', () => {
	it('owes only on issued invoices, less what has been paid on them', () => {
		const invoices = [
			{ id: 'issued', customerId: shop, status: InvoiceStatuses.issued },
			{ id: 'paid', customerId: shop, status: InvoiceStatuses.paid },
			{ id: 'void', customerId: shop, status: InvoiceStatuses.void },
			{ id: 'draft', customerId: shop, status: InvoiceStatuses.draft }
		];
		const lineTotals = [
			{ invoiceId: 'issued', amount: 100.1 },
			{ invoiceId: 'issued', amount: 0.2 },
			{ invoiceId: 'paid', amount: 50 }
		];
		const payments = [{ invoiceId: 'issued', amount: 40.1 }];
		expect(balanceOf(balancesOfCustomers(invoices, lineTotals, payments), shop)).toEqual({ invoiceCount: 4, unpaidInvoiceCount: 1, owed: 60.2 });
	});

	it('is nothing for a customer with no invoices', () => {
		expect(balanceOf(balancesOfCustomers([], [], []), shop)).toEqual({ invoiceCount: 0, unpaidInvoiceCount: 0, owed: 0 });
	});

	it('rounds a line to the penny', () => {
		expect(invoiceLineTotal(3, 33.333)).toBe(100);
	});
});
