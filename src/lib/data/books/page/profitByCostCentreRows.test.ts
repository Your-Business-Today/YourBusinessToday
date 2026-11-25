import { describe, expect, it } from 'vitest';
import { profitByCostCentreRows } from './profitByCostCentreRows';
import type { CostCentreProfit, CostCentreProfitLine } from '../reports/profitByCostCentre';

const profit = (costCentreId: string | null, label: string, income: number, costs: number): CostCentreProfit => ({
	costCentreId,
	label,
	income: { period: income, yearToDate: income },
	costs: { period: costs, yearToDate: costs },
	netProfit: { period: income - costs, yearToDate: income - costs }
});

const line = (costCentreId: string, label: string, costs: number): CostCentreProfitLine => ({ ...profit(costCentreId, label, 0, costs), sharedCosts: [] });
const nothingMoved = profit(null, 'Shared costs paid in a month other than the one they cover', 0, 0);

describe('profitByCostCentreRows', () => {
	it('shows each cost centre, the lines kept against none, and the whole organisation last', () => {
		const rows = profitByCostCentreRows({
			lines: [line('carp', 'Carp Mania', 25), line('aqua', 'ConservAqua Portal', 120)],
			unallocated: profit(null, 'Kept against no cost centre', 500, 40),
			sharedTiming: nothingMoved,
			total: profit(null, 'Whole organisation', 500, 185)
		});
		expect(rows.map((row) => [row.label, row.weight])).toEqual([
			['Carp Mania', 'line'],
			['ConservAqua Portal', 'line'],
			['Kept against no cost centre', 'line'],
			['Whole organisation', 'total']
		]);
		expect(rows[1].figures.map((figure) => figure.amount)).toEqual([0, 120, -120, -120]);
	});

	it('shows beneath a project its share of each shared cost, and the timing of shared costs when it moves anything', () => {
		const sharedCosts = [{ costCentreId: 'apple', label: 'Apple developer licence', costs: { period: 6.58, yearToDate: 39.5 } }];
		const rows = profitByCostCentreRows({
			lines: [{ ...line('carp', 'Carp Mania', 6.58), sharedCosts }],
			unallocated: profit(null, 'Kept against no cost centre', 0, 0),
			sharedTiming: profit(null, 'Shared costs paid in a month other than the one they cover', 0, -6.58),
			total: profit(null, 'Whole organisation', 0, 0)
		});
		expect(rows.map((row) => row.label)).toEqual([
			'Carp Mania',
			'of which its share of Apple developer licence',
			'Kept against no cost centre',
			'Shared costs paid in a month other than the one they cover',
			'Whole organisation'
		]);
		expect(rows[1].figures.map((figure) => figure.amount)).toEqual([null, 6.58, null, null]);
	});
});
