import { formatBritishDate } from '$lib/data/britishDate';
import type { BalanceSheet } from '../reports/balanceSheet';
import type { ProfitAndLoss } from '../reports/profitAndLoss';
import type { ReportPeriod } from '../reports/reportPeriod';
import type { TrialBalance } from '../reports/trialBalance';
import { balanceSheetRows } from './balanceSheetRows';
import { profitAndLossRows } from './profitAndLossRows';
import { trialBalanceRows } from './trialBalanceRows';
import type { EntriesLinker, StatementRow } from './statementRows';

/** The three statements of an organisation's books over one period, read from the same entries. */
export type BooksReports = {
	period: ReportPeriod;
	profitAndLoss: ProfitAndLoss;
	balanceSheet: BalanceSheet;
	trialBalance: TrialBalance;
};

/** A statement as the books page shows it: its name, the days it covers, its figure columns and its rows. */
export type BooksStatement = { key: string; title: string; caption: string; figureLabels: string[]; rows: StatementRow[] };

const FigureLabels = {
	profitAndLoss: ['This period', 'Year to date'],
	balanceSheet: ['Balance'],
	trialBalance: ['Debit', 'Credit']
};

export function booksStatementsOf(reports: BooksReports, linkEntries: EntriesLinker): BooksStatement[] {
	const { period } = reports;
	const atTheEnd = `At the end of ${formatBritishDate(period.end)}`;
	return [
		{
			key: 'profit-and-loss',
			title: 'Profit and loss',
			caption: `${formatBritishDate(period.start)} to ${formatBritishDate(period.end)}, and the year from ${formatBritishDate(period.yearStart)}`,
			figureLabels: FigureLabels.profitAndLoss,
			rows: profitAndLossRows(reports.profitAndLoss, period, linkEntries)
		},
		{
			key: 'balance-sheet',
			title: 'Balance sheet',
			caption: atTheEnd,
			figureLabels: FigureLabels.balanceSheet,
			rows: balanceSheetRows(reports.balanceSheet, linkEntries)
		},
		{
			key: 'trial-balance',
			title: 'Trial balance',
			caption: atTheEnd,
			figureLabels: FigureLabels.trialBalance,
			rows: trialBalanceRows(reports.trialBalance, linkEntries)
		}
	];
}
