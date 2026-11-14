import { describe, expect, it } from 'vitest';
import { daysOverdueOn, owedOn, type InvoiceAmounts } from './invoiceStanding';

const issued: InvoiceAmounts = { status: 'issued', dueDate: '2026-11-01', total: 1200, amountPaid: 200.4 };

describe('owedOn', () => {
	it('is what is left of an issued invoice after its payments', () => {
		expect(owedOn(issued)).toBe(999.6);
	});

	it('is nothing on a draft, a paid or a void invoice', () => {
		for (const status of ['draft', 'paid', 'void'] as const) expect(owedOn({ ...issued, status })).toBe(0);
	});
});

describe('daysOverdueOn', () => {
	it('counts the days an issued invoice is past its due date', () => {
		expect(daysOverdueOn(issued, '2026-11-13')).toBe(12);
	});

	it('is null on its due date and before it', () => {
		expect(daysOverdueOn(issued, '2026-11-01')).toBeNull();
		expect(daysOverdueOn(issued, '2026-10-20')).toBeNull();
	});

	it('is null for an invoice nobody owes on, however old', () => {
		expect(daysOverdueOn({ ...issued, status: 'paid' }, '2026-12-25')).toBeNull();
	});
});
