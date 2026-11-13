import { describe, expect, it } from 'vitest';
import { describeBillingPeriod, invoiceDateAfter, periodOfInvoice } from './billingPeriods';

const inWords = (invoiceDate: string, frequency: 'monthly' | 'quarterly' | 'yearly', covers: 'in_advance' | 'in_arrears') =>
	describeBillingPeriod(periodOfInvoice(invoiceDate, { frequency, covers }));

describe('the period an invoice from a schedule covers, in words', () => {
	it('reads a whole calendar month as that month', () => {
		expect(inWords('2026-12-01', 'monthly', 'in_advance')).toBe('December 2026');
		expect(inWords('2026-12-01', 'monthly', 'in_arrears')).toBe('November 2026');
		expect(inWords('2027-03-01', 'monthly', 'in_arrears')).toBe('February 2027');
	});

	it('reads any other period by its first and last day', () => {
		expect(inWords('2026-12-15', 'monthly', 'in_advance')).toBe('15 December 2026 to 14 January 2027');
		expect(inWords('2026-12-01', 'quarterly', 'in_advance')).toBe('1 December 2026 to 28 February 2027');
		expect(inWords('2026-12-01', 'quarterly', 'in_arrears')).toBe('1 September 2026 to 30 November 2026');
		expect(inWords('2028-03-01', 'yearly', 'in_arrears')).toBe('1 March 2027 to 29 February 2028');
	});

	it('moves the next invoice date on by one period, keeping its day of the month', () => {
		expect(invoiceDateAfter('2026-12-28', 'monthly')).toBe('2027-01-28');
		expect(invoiceDateAfter('2026-12-01', 'quarterly')).toBe('2027-03-01');
		expect(invoiceDateAfter('2027-02-28', 'yearly')).toBe('2028-02-28');
	});
});
