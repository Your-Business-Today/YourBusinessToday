import type { LedgerEntry } from '../ledgerEntry';
import type { ApportionedEntry } from '../sharing/apportionedEntries';
import type { ProfitAndLossTotals } from './profitAndLoss';
import type { ReportPeriod } from './reportPeriod';
import { profitOf } from './costCentreProfit';
import { differenceOfProfits, sharedCostPartsOf, type SharedCostPart } from './sharedCostParts';

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

/** A project's cost centre's profit, with what it took of each shared cost. */
export type CostCentreProfitLine = CostCentreProfit & { sharedCosts: SharedCostPart[] };

/**
 * Each cost centre's profit, then what no cost centre carries, then what shared costs paid in one month and covering
 * others move between periods, then the whole organisation as the books keep it, which they add up to.
 */
export type ProfitByCostCentre = { lines: CostCentreProfitLine[]; unallocated: CostCentreProfit; sharedTiming: CostCentreProfit; total: CostCentreProfit };

/** The lines as the books keep them, and the cost centres whose lines are shared among projects rather than shown on their own. */
export type SharedCostReading = { asBooked: LedgerEntry[]; sharedCostCentres: ReportedCostCentre[] };

export const ProfitByCostCentreLabels = {
	unallocated: 'Kept against no cost centre',
	sharedTiming: 'Shared costs paid in a month other than the one they cover',
	total: 'Whole organisation'
} as const;

/** The profit and loss of every live cost centre side by side, and of an archived one only while it carries figures. */
export function buildProfitByCostCentre(
	entries: ApportionedEntry[],
	period: ReportPeriod,
	costCentres: ReportedCostCentre[],
	sharing: SharedCostReading = { asBooked: entries, sharedCostCentres: [] }
): ProfitByCostCentre {
	const sharedIds = new Set(sharing.sharedCostCentres.map((costCentre) => costCentre.id));
	const ownCostCentres = costCentres.filter((costCentre) => !sharedIds.has(costCentre.id));
	const knownIds = new Set(ownCostCentres.map((costCentre) => costCentre.id));
	const kept = ownCostCentres.map((costCentre) => ({ costCentre, profit: costCentreProfit(costCentre, entries, period, sharing) }));
	const shown = kept.filter(({ costCentre, profit }) => !costCentre.isArchived || hasFigures(profit));
	const unallocatedEntries = entries.filter((entry) => entry.costCentreId === null || !knownIds.has(entry.costCentreId));
	const total = profitOf(null, ProfitByCostCentreLabels.total, sharing.asBooked, period);
	const apportionedTotal = profitOf(null, ProfitByCostCentreLabels.total, entries, period);
	return {
		lines: shown.map(({ profit }) => profit),
		unallocated: profitOf(null, ProfitByCostCentreLabels.unallocated, unallocatedEntries, period),
		sharedTiming: differenceOfProfits(ProfitByCostCentreLabels.sharedTiming, total, apportionedTotal),
		total
	};
}

function costCentreProfit(costCentre: ReportedCostCentre, entries: ApportionedEntry[], period: ReportPeriod, sharing: SharedCostReading): CostCentreProfitLine {
	const within = entries.filter((entry) => entry.costCentreId === costCentre.id);
	const sharedCosts = sharedCostPartsOf(within, period, sharing.sharedCostCentres);
	return { ...profitOf(costCentre.id, costCentre.label, within, period), sharedCosts };
}

function hasFigures(profit: CostCentreProfit): boolean {
	const { income, costs } = profit;
	const figures = [income.yearToDate, costs.yearToDate];
	return figures.some((figure) => figure !== 0);
}
