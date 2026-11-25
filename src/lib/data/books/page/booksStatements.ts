import { formatBritishDate } from '$lib/data/britishDate';
import type { BalanceSheet } from '../reports/balanceSheet';
import type { ProfitAndLoss } from '../reports/profitAndLoss';
import type { ProfitByCostCentre } from '../reports/profitByCostCentre';
import { profitByCostCentreRows } from './profitByCostCentreRows';
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
	profitByCostCentre: ProfitByCostCentre;
	balanceSheet: BalanceSheet;
	trialBalance: TrialBalance;
};

/** A statement as the books page shows it: its name, the days it covers, its figure columns and its rows. */
export type BooksStatement = { key: string; title: string; caption: string; figureLabels: string[]; rows: StatementRow[] };

const FigureLabels = {
	profitAndLoss: ['This period', 'Year to date'],
	profitByProject: ['Income', 'Costs', 'Net profit', 'Net profit, year to date'],
	balanceSheet: ['Balance'],
	trialBalance: ['Debit', 'Credit']
};

export function booksStatementsOf(reports: BooksReports, linkEntries: EntriesLinker): BooksStatement[] {
	const { period } = reports;
	const atTheEnd = `At the end of ${formatBritishDate(period.end)}`;
	const periodAndYear = `${formatBritishDate(period.start)} to ${formatBritishDate(period.end)}, and the year from ${formatBritishDate(period.yearStart)}`;
	return [
		statement('profit-and-loss', 'Profit and loss', periodAndYear, FigureLabels.profitAndLoss, profitAndLossRows(reports.profitAndLoss, period, linkEntries)),
		statement('balance-sheet', 'Balance sheet', atTheEnd, FigureLabels.balanceSheet, balanceSheetRows(reports.balanceSheet, linkEntries)),
		statement('trial-balance', 'Trial balance', atTheEnd, FigureLabels.trialBalance, trialBalanceRows(reports.trialBalance, linkEntries)),
		statement(
			'profit-by-project',
			'Profit by project',
			`${periodAndYear}, for each cost centre and the project it is kept for`,
			FigureLabels.profitByProject,
			profitByCostCentreRows(reports.profitByCostCentre)
		)
	];
}

function statement(key: string, title: string, caption: string, figureLabels: string[], rows: StatementRow[]): BooksStatement {
	return { key, title, caption, figureLabels, rows };
}
