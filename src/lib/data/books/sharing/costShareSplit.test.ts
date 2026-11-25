import { describe, expect, it } from 'vitest';
import { LedgerAccountTypes } from '../ledgerAccountTypes';
import { costShareSplit, twelveMonthsTo } from './costShareSplit';

const software = { accountId: 'account-6100', accountCode: '6100', accountName: 'Software', accountType: LedgerAccountTypes.expense };
const share = { id: 'share-apple', costCentreId: 'cost-centre-apple', monthsCovered: 12, membersBy: 'named' as const, members: [] };
const part = (journalDate: string, costCentreId: string | null, debit: number) => ({
	journalDate,
	...software,
	costCentreId,
	debit,
	credit: 0,
	sharedFromCostCentreId: share.costCentreId
});

describe('costShareSplit', () => {
	it('gives each month what each cost centre took of the shared cost, and nothing for a month with no part', () => {
		const entries = [part('2026-07-01', 'carp', 3.29), part('2026-07-01', 'cod', 3.29), part('2026-08-01', null, 6.58)];
		const split = costShareSplit(entries, share, ['2026-06', '2026-07', '2026-08']);
		expect(split).toEqual([
			{ month: '2026-06', parts: [], isSplitEquallyWithoutUsage: false },
			{
				month: '2026-07',
				parts: [
					{ costCentreId: 'carp', amount: 3.29 },
					{ costCentreId: 'cod', amount: 3.29 }
				],
				isSplitEquallyWithoutUsage: false
			},
			{ month: '2026-08', parts: [{ costCentreId: null, amount: 6.58 }], isSplitEquallyWithoutUsage: false }
		]);
	});
});

describe('twelveMonthsTo', () => {
	it('runs the twelve months up to and including the month given', () => {
		const months = twelveMonthsTo('2026-11');
		expect([months[0], months.at(-1), months.length]).toEqual(['2025-12', '2026-11', 12]);
	});
});
