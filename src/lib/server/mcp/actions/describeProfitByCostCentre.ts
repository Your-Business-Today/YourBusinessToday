import { formatPoundsAndPence } from '$lib/data/books/money';
import type { CostCentreProfit, ProfitByCostCentre } from '$lib/data/books/reports/profitByCostCentre';

/** The organisation and days a profit by project reading was asked for. */
export type ProfitByCostCentreHeading = { organisationName: string; periodStart: string; periodEnd: string };

export function describeProfitByCostCentre(heading: ProfitByCostCentreHeading, report: ProfitByCostCentre): string {
	const { organisationName, periodStart, periodEnd } = heading;
	return [
		`Profit and loss of ${organisationName} by cost centre, from ${periodStart} to ${periodEnd}, with the financial year to date:`,
		'',
		...costCentreLines(report.lines),
		profitLine(report.unallocated),
		'',
		`${profitLine(report.total)}`
	].join('\n');
}

function costCentreLines(lines: CostCentreProfit[]): string[] {
	if (lines.length === 0) return ['- No cost centres yet: create_cost_centre adds one, and set_cost_centre_project keeps it for a project.'];
	return lines.map(profitLine);
}

function profitLine(profit: CostCentreProfit): string {
	const { income, costs, netProfit } = profit;
	const period = `income ${formatPoundsAndPence(income.period)}, costs ${formatPoundsAndPence(costs.period)}, net ${formatPoundsAndPence(netProfit.period)}`;
	const year = `year to date income ${formatPoundsAndPence(income.yearToDate)}, costs ${formatPoundsAndPence(costs.yearToDate)}, net ${formatPoundsAndPence(netProfit.yearToDate)}`;
	return `- ${profit.label}: in the period ${period}; ${year}`;
}
