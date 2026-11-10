import { formatPoundsAndPence } from '$lib/data/books/money';
import type { ProfitAndLoss, ProfitAndLossLine, ProfitAndLossTotals } from '$lib/data/books/reports/profitAndLoss';

/** The days a profit and loss was asked for, and the cost centre it was narrowed to, if any. */
export type ProfitAndLossHeading = { organisationName: string; periodStart: string; periodEnd: string; costCentreId: string | null };

export function describeProfitAndLoss(heading: ProfitAndLossHeading, report: ProfitAndLoss): string {
	return [
		headingSentence(heading),
		'',
		'Income:',
		...sideLines(report.income),
		`- Total income: ${totalsText(report.totalIncome)}`,
		'',
		'Expenses:',
		...sideLines(report.expenses),
		`- Total expenses: ${totalsText(report.totalExpenses)}`,
		'',
		`Net profit: ${totalsText(report.netProfit)}`
	].join('\n');
}

function headingSentence(heading: ProfitAndLossHeading): string {
	const opening = `Profit and loss of ${heading.organisationName} from ${heading.periodStart} to ${heading.periodEnd}, with the financial year to date`;
	if (heading.costCentreId === null) return `${opening}:`;
	return `${opening}, within cost centre ${heading.costCentreId} alone:`;
}

function sideLines(lines: ProfitAndLossLine[]): string[] {
	if (lines.length === 0) return ['- None'];
	return lines.map((line) => `- ${line.accountCode} ${line.accountName}: ${totalsText(line)}`);
}

function totalsText(totals: ProfitAndLossTotals): string {
	return `${formatPoundsAndPence(totals.period)} in the period, ${formatPoundsAndPence(totals.yearToDate)} year to date`;
}
