import type { LedgerEntry } from '../ledgerEntry';
import { buildProfitAndLoss } from './profitAndLoss';
import type { CostCentreProfit } from './profitByCostCentre';
import type { ReportPeriod } from './reportPeriod';

const everyEntryGiven = null;

/** The income, costs and net profit of the lines given, for the period and the year to date. */
export function profitOf(costCentreId: string | null, label: string, entries: LedgerEntry[], period: ReportPeriod): CostCentreProfit {
	const report = buildProfitAndLoss(entries, period, everyEntryGiven);
	return { costCentreId, label, income: report.totalIncome, costs: report.totalExpenses, netProfit: report.netProfit };
}
