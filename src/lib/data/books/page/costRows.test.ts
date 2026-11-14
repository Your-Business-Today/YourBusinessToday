import { describe, expect, it } from 'vitest';
import { costsOnTab, describeOwedToSuppliers, type CostRow } from './costRows';

const costOf = (id: string, amount: number, paidOn: string | null): CostRow => ({
	id,
	date: '2026-10-25',
	supplier: 'Vercel',
	what: 'Hosting',
	account: '7600 Software',
	amount,
	paidOn
});

const hosting = costOf('hosting', 20.5, null);
const domain = costOf('domain', 12.99, null);
const insurance = costOf('insurance', 300.1, '2026-11-06');
const costs = [hosting, domain, insurance];

describe('costsOnTab', () => {
	it('lists the unpaid costs on Unpaid, the paid ones on Paid and every one on All', () => {
		expect(costsOnTab(costs, 'unpaid')).toEqual([hosting, domain]);
		expect(costsOnTab(costs, 'paid')).toEqual([insurance]);
		expect(costsOnTab(costs, 'all')).toEqual(costs);
	});
});

describe('describeOwedToSuppliers', () => {
	it('sums the unpaid costs to the penny', () => {
		expect(describeOwedToSuppliers(costs)).toBe('£33.49 is owed to suppliers, across 2 unpaid costs.');
	});

	it('names a single unpaid cost as one', () => {
		expect(describeOwedToSuppliers([hosting, insurance])).toBe('£20.50 is owed to suppliers, across one unpaid cost.');
	});

	it('says nothing is owed when every cost is paid', () => {
		expect(describeOwedToSuppliers([insurance])).toBe('Nothing is owed to suppliers.');
	});
});
