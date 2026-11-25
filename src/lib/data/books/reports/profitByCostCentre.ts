import type { LedgerEntry } from '../ledgerEntry';
import { buildProfitAndLoss, type ProfitAndLossTotals } from './profitAndLoss';
import type { ReportPeriod } from './reportPeriod';

/** A cost centre as the profit by project reading names it, with the project it is kept for in its label. */
export type ReportedCostCentre = { id: string; label: string; isArchived: boolean };

/** What one cost centre, or the lines kept within none, earned and cost in the period and the year to date. */
export type CostCentreProfit = {
	costCentreId: string | null;
	label: string;
	income: ProfitAndLossTotals;
	costs: ProfitAndLossTotals;
	netProfit: ProfitAndLossTotals;
};

/** Each cost centre's profit, then what no cost centre carries, then the whole organisation they add up to. */
export type ProfitByCostCentre = { lines: CostCentreProfit[]; unallocated: CostCentreProfit; total: CostCentreProfit };

export const ProfitByCostCentreLabels = { unallocated: 'Kept against no cost centre', total: 'Whole organisation' } as const;

/** The profit and loss of every live cost centre side by side, and of an archived one only while it carries figures. */
export function buildProfitByCostCentre(entries: LedgerEntry[], period: ReportPeriod, costCentres: ReportedCostCentre[]): ProfitByCostCentre {
	const knownIds = new Set(costCentres.map((costCentre) => costCentre.id));
	const kept = costCentres.map((costCentre) => ({ costCentre, profit: costCentreProfit(costCentre, entries, period) }));
	const shown = kept.filter(({ costCentre, profit }) => !costCentre.isArchived || hasFigures(profit));
	const unallocatedEntries = entries.filter((entry) => entry.costCentreId === null || !knownIds.has(entry.costCentreId));
	return {
		lines: shown.map(({ profit }) => profit),
		unallocated: profitOf(null, ProfitByCostCentreLabels.unallocated, unallocatedEntries, period),
		total: profitOf(null, ProfitByCostCentreLabels.total, entries, period)
	};
}

function costCentreProfit(costCentre: ReportedCostCentre, entries: LedgerEntry[], period: ReportPeriod): CostCentreProfit {
	const within = entries.filter((entry) => entry.costCentreId === costCentre.id);
	return profitOf(costCentre.id, costCentre.label, within, period);
}

function profitOf(costCentreId: string | null, label: string, entries: LedgerEntry[], period: ReportPeriod): CostCentreProfit {
	const everyEntryGiven = null;
	const report = buildProfitAndLoss(entries, period, everyEntryGiven);
	return { costCentreId, label, income: report.totalIncome, costs: report.totalExpenses, netProfit: report.netProfit };
}

function hasFigures(profit: CostCentreProfit): boolean {
	const { income, costs } = profit;
	const figures = [income.yearToDate, costs.yearToDate];
	return figures.some((figure) => figure !== 0);
}
