import type { CostCentreProfit, ProfitByCostCentre } from '../reports/profitByCostCentre';
import { StatementRowWeights, totalRow, type StatementRow } from './statementRows';

const unallocatedKey = 'unallocated';

/** A row for each cost centre, then what no cost centre carries, then the whole organisation they add up to. */
export function profitByCostCentreRows(report: ProfitByCostCentre): StatementRow[] {
	const lines = report.lines.map((line) => costCentreRow(line.costCentreId ?? unallocatedKey, line));
	const total = report.total;
	return [...lines, costCentreRow(unallocatedKey, report.unallocated), totalRow(total.label, figuresOf(total))];
}

function costCentreRow(key: string, profit: CostCentreProfit): StatementRow {
	const figures = figuresOf(profit).map((amount) => ({ amount, href: null }));
	return { key, label: profit.label, href: null, weight: StatementRowWeights.line, figures };
}

function figuresOf(profit: CostCentreProfit): number[] {
	const { income, costs, netProfit } = profit;
	return [income.period, costs.period, netProfit.period, netProfit.yearToDate];
}
