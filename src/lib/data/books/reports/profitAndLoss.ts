import { differenceOf, sumMoney } from '../money';
import { LedgerAccountTypes } from '../ledgerAccountTypes';
import type { LedgerEntry } from '../ledgerEntry';
import { balancesByAccount } from './accountBalances';
import type { ReportPeriod } from './reportPeriod';

export type ProfitAndLossLine = { accountCode: string; accountName: string; period: number; yearToDate: number };

export type ProfitAndLossTotals = { period: number; yearToDate: number };

export type ProfitAndLoss = {
	income: ProfitAndLossLine[];
	expenses: ProfitAndLossLine[];
	totalIncome: ProfitAndLossTotals;
	totalExpenses: ProfitAndLossTotals;
	netProfit: ProfitAndLossTotals;
};

type ProfitAndLossSide = typeof LedgerAccountTypes.income | typeof LedgerAccountTypes.expense;

/** Income and expenses for the period and the financial year to its end, within one cost centre or all. */
export function buildProfitAndLoss(entries: LedgerEntry[], period: ReportPeriod, costCentreId: string | null): ProfitAndLoss {
	const relevant = entries.filter((entry) => costCentreId === null || entry.costCentreId === costCentreId);
	const income = linesOfType(relevant, LedgerAccountTypes.income, period);
	const expenses = linesOfType(relevant, LedgerAccountTypes.expense, period);
	const totalIncome = totalsOf(income);
	const totalExpenses = totalsOf(expenses);
	return {
		income,
		expenses,
		totalIncome,
		totalExpenses,
		netProfit: {
			period: differenceOf(totalIncome.period, totalExpenses.period),
			yearToDate: differenceOf(totalIncome.yearToDate, totalExpenses.yearToDate)
		}
	};
}

function linesOfType(entries: LedgerEntry[], accountType: ProfitAndLossSide, period: ReportPeriod): ProfitAndLossLine[] {
	const typed = entries.filter((entry) => entry.accountType === accountType);
	const periodBalances = balancesByAccount(typed.filter((entry) => isBetween(entry.journalDate, period.start, period.end)));
	const yearBalances = balancesByAccount(typed.filter((entry) => isBetween(entry.journalDate, period.yearStart, period.end)));
	return yearBalances.map((yearBalance) => ({
		accountCode: yearBalance.accountCode,
		accountName: yearBalance.accountName,
		period: periodBalances.find((balance) => balance.accountId === yearBalance.accountId)?.balance ?? 0,
		yearToDate: yearBalance.balance
	}));
}

function totalsOf(lines: ProfitAndLossLine[]): ProfitAndLossTotals {
	return {
		period: sumMoney(lines.map((line) => line.period)),
		yearToDate: sumMoney(lines.map((line) => line.yearToDate))
	};
}

function isBetween(isoDate: string, start: string, end: string): boolean {
	return isoDate >= start && isoDate <= end;
}
