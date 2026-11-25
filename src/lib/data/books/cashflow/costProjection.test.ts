import { describe, expect, it } from 'vitest';
import type { LedgerEntry } from '../ledgerEntry';
import { accounts, costCentres } from '../reports/ledgerEntries.fixtures';
import { buildCostProjections } from './costProjection';
import type { CashflowItem } from './cashflowItem';

const conservAqua = { id: costCentres.office, label: 'Sales lead (ConservAqua Portal)', isArchived: false };
const carpMania = { id: costCentres.shop, label: 'Carp Mania', isArchived: false };
const azureSoFar: LedgerEntry = { journalDate: '2026-11-10', ...accounts.rent, costCentreId: costCentres.office, debit: 100, credit: 0 };
const sponsorPaid: LedgerEntry = { journalDate: '2026-11-12', ...accounts.sales, costCentreId: costCentres.shop, debit: 0, credit: 300 };
const azureMonthly: CashflowItem = {
	id: 'azure',
	title: 'Azure for ConservAqua',
	direction: 'out',
	amount: 50,
	repeats: 'monthly',
	firstMonth: '2026-12',
	lastMonth: null,
	notes: ''
};
const inputs = {
	entries: [azureSoFar, sponsorPaid],
	items: [azureMonthly],
	itemCostCentres: new Map([['azure', costCentres.office]]),
	months: ['2026-12', '2027-01']
};

describe('buildCostProjections', () => {
	it('adds a project’s forecast items, month by month, to what its lines have cost so far', () => {
		const [projection] = buildCostProjections(inputs, [conservAqua]);
		expect(projection.soFar).toEqual({ costs: 100, income: 0, net: -100 });
		expect(projection.months).toEqual([
			{ month: '2026-12', costs: 150, income: 0, net: -150 },
			{ month: '2027-01', costs: 200, income: 0, net: -200 }
		]);
	});

	it('keeps an item to the cost centre it is kept against, and counts income as earned', () => {
		const [, projection] = buildCostProjections(inputs, [conservAqua, carpMania]);
		expect(projection.soFar).toEqual({ costs: 0, income: 300, net: 300 });
		expect(projection.months.map((month) => month.costs)).toEqual([0, 0]);
	});

	it('leaves out an archived cost centre with nothing so far or ahead', () => {
		const closed = { id: 'cost-centre-closed', label: 'Closed', isArchived: true };
		expect(buildCostProjections(inputs, [closed])).toEqual([]);
	});
});
