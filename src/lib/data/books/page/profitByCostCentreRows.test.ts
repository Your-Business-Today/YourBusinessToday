import { describe, expect, it } from 'vitest';
import { profitByCostCentreRows } from './profitByCostCentreRows';
import type { CostCentreProfit } from '../reports/profitByCostCentre';

const profit = (costCentreId: string | null, label: string, income: number, costs: number): CostCentreProfit => ({
	costCentreId,
	label,
	income: { period: income, yearToDate: income },
	costs: { period: costs, yearToDate: costs },
	netProfit: { period: income - costs, yearToDate: income - costs }
});

describe('profitByCostCentreRows', () => {
	it('shows each cost centre, the lines kept against none, and the whole organisation last', () => {
		const rows = profitByCostCentreRows({
			lines: [profit('carp', 'Carp Mania', 0, 25), profit('aqua', 'ConservAqua Portal', 0, 120)],
			unallocated: profit(null, 'Kept against no cost centre', 500, 40),
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
});
