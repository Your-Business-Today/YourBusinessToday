import { monthEnd, monthStart, type MonthKey } from '../monthKey';
import { SystemAccounts, type SystemAccount } from '../systemAccounts';
import type { LedgerEntry } from '../ledgerEntry';
import type { AccountBalance } from './accountBalances';
import { buildBalanceSheet } from './balanceSheet';
import { buildProfitAndLoss, type ProfitAndLossTotals } from './profitAndLoss';
import { financialYearStart, type FinancialYear } from '../financialYear';

/**
 * How an organisation's books stand for a month: the bank, what customers owe and what is owed to suppliers at its
 * end, and its income, costs and net profit, each with the financial year to date.
 */
export type BooksStanding = {
	monthKey: MonthKey;
	bank: number;
	debtors: number;
	creditors: number;
	income: ProfitAndLossTotals;
	costs: ProfitAndLossTotals;
	netProfit: ProfitAndLossTotals;
};

/** The standing of the books for the month, from every entry posted up to its last day. */
export function buildBooksStanding(entries: LedgerEntry[], monthKey: MonthKey, financialYear: FinancialYear): BooksStanding {
	const lastDay = monthEnd(monthKey);
	const sheet = buildBalanceSheet(entries, lastDay);
	const month = { start: monthStart(monthKey), end: lastDay, yearStart: financialYearStart(lastDay, financialYear) };
	const profitAndLoss = buildProfitAndLoss(entries, month, null);
	return {
		monthKey,
		bank: balanceOfSystemAccount(sheet.assets, SystemAccounts.bank),
		debtors: balanceOfSystemAccount(sheet.assets, SystemAccounts.tradeDebtors),
		creditors: balanceOfSystemAccount(sheet.liabilities, SystemAccounts.tradeCreditors),
		income: profitAndLoss.totalIncome,
		costs: profitAndLoss.totalExpenses,
		netProfit: profitAndLoss.netProfit
	};
}

function balanceOfSystemAccount(balances: AccountBalance[], account: SystemAccount): number {
	const held = balances.find((balance) => balance.accountCode === account.code);
	return held?.balance ?? 0;
}
