import type { CostCentreProfit, CostCentreProfitLine, ProfitByCostCentre } from '../reports/profitByCostCentre';
import type { SharedCostPart } from '../reports/sharedCostParts';
import { StatementRowWeights, totalRow, type StatementRow } from './statementRows';

const RowKeys = { unallocated: 'unallocated', sharedTiming: 'shared-timing', sharedPart: 'shared' } as const;
const blank = { amount: null, href: null };

/**
 * A row for each cost centre with a row beneath for each shared cost it took a part of, then what no cost centre
 * carries, then what shared costs move between periods when shown, then the whole organisation they add up to.
 */
export function profitByCostCentreRows(report: ProfitByCostCentre): StatementRow[] {
	const lines = report.lines.flatMap(lineRows);
	const timing = hasAnyFigure(report.sharedTiming) ? [costCentreRow(RowKeys.sharedTiming, report.sharedTiming)] : [];
	const total = report.total;
	return [...lines, costCentreRow(RowKeys.unallocated, report.unallocated), ...timing, totalRow(total.label, figuresOf(total))];
}

function lineRows(line: CostCentreProfitLine): StatementRow[] {
	const key = line.costCentreId ?? RowKeys.unallocated;
	return [costCentreRow(key, line), ...line.sharedCosts.map((part) => sharedPartRow(key, part))];
}

function sharedPartRow(lineKey: string, part: SharedCostPart): StatementRow {
	const costs = { amount: part.costs.period, href: null };
	const key = `${lineKey}-${RowKeys.sharedPart}-${part.costCentreId}`;
	return { key, label: `of which its share of ${part.label}`, href: null, weight: StatementRowWeights.line, figures: [blank, costs, blank, blank] };
}

function costCentreRow(key: string, profit: CostCentreProfit): StatementRow {
	const figures = figuresOf(profit).map((amount) => ({ amount, href: null }));
	return { key, label: profit.label, href: null, weight: StatementRowWeights.line, figures };
}

function hasAnyFigure(profit: CostCentreProfit): boolean {
	return figuresOf(profit).some((amount) => amount !== 0) || profit.costs.yearToDate !== 0;
}

function figuresOf(profit: CostCentreProfit): number[] {
	const { income, costs, netProfit } = profit;
	return [income.period, costs.period, netProfit.period, netProfit.yearToDate];
}
