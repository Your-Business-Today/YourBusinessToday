import { differenceOf } from '../money';
import type { ApportionedEntry } from '../sharing/apportionedEntries';
import type { ProfitAndLossTotals } from './profitAndLoss';
import { profitOf } from './costCentreProfit';
import type { CostCentreProfit, ReportedCostCentre } from './profitByCostCentre';
import type { ReportPeriod } from './reportPeriod';

/** What a project's cost centre took of one shared cost, in the period and the year to date. */
export type SharedCostPart = { costCentreId: string; label: string; costs: ProfitAndLossTotals };

/** Each shared cost the lines took a part of, with the costs of that part. */
export function sharedCostPartsOf(entries: ApportionedEntry[], period: ReportPeriod, sharedCostCentres: ReportedCostCentre[]): SharedCostPart[] {
	return sharedCostCentres.flatMap((shared) => {
		const parts = entries.filter((entry) => entry.sharedFromCostCentreId === shared.id);
		if (parts.length === 0) return [];
		const { costs } = profitOf(shared.id, shared.label, parts, period);
		return [{ costCentreId: shared.id, label: shared.label, costs }];
	});
}

/** The figures by which one reading differs from another, as a line of its own. */
export function differenceOfProfits(label: string, whole: CostCentreProfit, part: CostCentreProfit): CostCentreProfit {
	return {
		costCentreId: null,
		label,
		income: differenceOfTotals(whole.income, part.income),
		costs: differenceOfTotals(whole.costs, part.costs),
		netProfit: differenceOfTotals(whole.netProfit, part.netProfit)
	};
}

function differenceOfTotals(whole: ProfitAndLossTotals, part: ProfitAndLossTotals): ProfitAndLossTotals {
	return { period: differenceOf(whole.period, part.period), yearToDate: differenceOf(whole.yearToDate, part.yearToDate) };
}
