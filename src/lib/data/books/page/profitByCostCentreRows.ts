import type { CostCentreProfit, CostCentreProfitLine, ProfitByCostCentre } from '../reports/profitByCostCentre';
import { StatementRowWeights, totalRow, type StatementRow } from './statementRows';

const RowKeys = { unallocated: 'unallocated', sharedTiming: 'shared-timing' } as const;

/**
 * One row for each project, its shares of shared costs already in its figures, then what no project carries, then
 * what shared costs move between periods when shown, then the whole organisation they add up to.
 */
export function profitByCostCentreRows(report: ProfitByCostCentre): StatementRow[] {
	const lines = report.lines.map(lineRow);
	const timing = hasAnyFigure(report.sharedTiming) ? [costCentreRow(RowKeys.sharedTiming, report.sharedTiming)] : [];
	const total = report.total;
	return [...lines, costCentreRow(RowKeys.unallocated, report.unallocated), ...timing, totalRow(total.label, figuresOf(total))];
}

function lineRow(line: CostCentreProfitLine): StatementRow {
	return costCentreRow(line.costCentreId ?? RowKeys.unallocated, line);
}

function costCentreRow(key: string, profit: CostCentreProfit): StatementRow {
	const figures = figuresOf(profit).map((amount) => ({ amount, href: null }));
	return { key, label: profit.label, href: null, weight: StatementRowWeights.line, figures };
}

function hasAnyFigure(profit: CostCentreProfit): boolean {
	const { costs } = profit;
	return figuresOf(profit).some((amount) => amount !== 0) || costs.yearToDate !== 0;
}

function figuresOf(profit: CostCentreProfit): number[] {
	const { income, costs, netProfit } = profit;
	return [income.period, costs.period, netProfit.period, netProfit.yearToDate];
}
