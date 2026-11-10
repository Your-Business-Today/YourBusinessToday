import type { ProfitAndLoss, ProfitAndLossLine, ProfitAndLossTotals } from '../reports/profitAndLoss';
import type { ReportPeriod } from '../reports/reportPeriod';
import { accountRow, headingRow, totalRow, type EntriesLinker, type StatementRow } from './statementRows';

const Labels = {
	income: 'Income',
	totalIncome: 'Total income',
	expenses: 'Expenses',
	totalExpenses: 'Total expenses',
	netProfit: 'Net profit'
} as const;

/** Income, then expenses, then the net profit, each for the period and the financial year to its end. */
export function profitAndLossRows(report: ProfitAndLoss, period: ReportPeriod, linkEntries: EntriesLinker): StatementRow[] {
	const lineRow = (line: ProfitAndLossLine) => linkedLineRow(line, period, linkEntries);
	return [
		headingRow(Labels.income),
		...report.income.map(lineRow),
		totalRow(Labels.totalIncome, bothFigures(report.totalIncome)),
		headingRow(Labels.expenses),
		...report.expenses.map(lineRow),
		totalRow(Labels.totalExpenses, bothFigures(report.totalExpenses)),
		totalRow(Labels.netProfit, bothFigures(report.netProfit))
	];
}

function linkedLineRow(line: ProfitAndLossLine, period: ReportPeriod, linkEntries: EntriesLinker): StatementRow {
	const periodSpan = { start: period.start, end: period.end };
	const yearSpan = { start: period.yearStart, end: period.end };
	return accountRow(line, [
		{ amount: line.period, href: linkEntries(line.accountCode, periodSpan) },
		{ amount: line.yearToDate, href: linkEntries(line.accountCode, yearSpan) }
	]);
}

function bothFigures(totals: ProfitAndLossTotals): number[] {
	return [totals.period, totals.yearToDate];
}
