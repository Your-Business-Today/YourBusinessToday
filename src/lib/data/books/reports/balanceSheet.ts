import { differenceOf, sumMoney } from '../money';
import { LedgerAccountTypes, type LedgerAccountType } from '../ledgerAccountTypes';
import type { LedgerEntry } from '../ledgerEntry';
import { balancesByAccount, totalOf, type AccountBalance } from './accountBalances';

export type BalanceSheet = {
	asAt: string;
	assets: AccountBalance[];
	liabilities: AccountBalance[];
	equity: AccountBalance[];
	retainedEarnings: number;
	totalAssets: number;
	totalLiabilities: number;
	totalEquity: number;
	isBalanced: boolean;
};

/** What is owned, owed and invested at the end of the day asAt, with all profit to date as retained earnings. */
export function buildBalanceSheet(entries: LedgerEntry[], asAt: string): BalanceSheet {
	const upToDate = entries.filter((entry) => entry.journalDate <= asAt);
	const assets = nonZeroBalancesOfType(upToDate, LedgerAccountTypes.asset);
	const liabilities = nonZeroBalancesOfType(upToDate, LedgerAccountTypes.liability);
	const equity = nonZeroBalancesOfType(upToDate, LedgerAccountTypes.equity);
	const income = totalOf(balancesOfType(upToDate, LedgerAccountTypes.income));
	const retainedEarnings = differenceOf(income, totalOf(balancesOfType(upToDate, LedgerAccountTypes.expense)));
	const totalAssets = totalOf(assets);
	const totalLiabilities = totalOf(liabilities);
	const totalEquity = sumMoney([totalOf(equity), retainedEarnings]);
	const claimsOnAssets = sumMoney([totalLiabilities, totalEquity]);
	return {
		asAt,
		assets,
		liabilities,
		equity,
		retainedEarnings,
		totalAssets,
		totalLiabilities,
		totalEquity,
		isBalanced: totalAssets === claimsOnAssets
	};
}

function balancesOfType(entries: LedgerEntry[], accountType: LedgerAccountType): AccountBalance[] {
	return balancesByAccount(entries.filter((entry) => entry.accountType === accountType));
}

function nonZeroBalancesOfType(entries: LedgerEntry[], accountType: LedgerAccountType): AccountBalance[] {
	return balancesOfType(entries, accountType).filter((balance) => balance.balance !== 0);
}
