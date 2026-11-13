import { describe, expect, it } from 'vitest';
import type { CostRow } from '$lib/data/books/page/costRows';
import { costTabsOf } from './costTabs';

const costOf = (id: string, paidOn: string | null): CostRow => ({
	id,
	date: '2026-10-25',
	supplier: 'Vercel',
	what: 'Hosting',
	account: '7600 Software',
	amount: 20,
	paidOn
});

describe('costTabsOf', () => {
	it('counts the unpaid, the paid and every cost on their tabs', () => {
		const tabs = costTabsOf([costOf('hosting', null), costOf('domain', null), costOf('insurance', '2026-11-06')]);
		expect(tabs).toEqual([
			{ key: 'unpaid', label: 'Unpaid', count: 2 },
			{ key: 'paid', label: 'Paid', count: 1 },
			{ key: 'all', label: 'All', count: 3 }
		]);
	});

	it('shows no count on a tab with nothing on it', () => {
		const [unpaid] = costTabsOf([costOf('insurance', '2026-11-06')]);
		expect(unpaid.count).toBeNull();
	});
});
