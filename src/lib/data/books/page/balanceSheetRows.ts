import { sumMoney } from '../money';
import type { AccountBalance } from '../reports/accountBalances';
import type { BalanceSheet } from '../reports/balanceSheet';
import type { EntriesSpan } from './booksPeriodQuery';
import { accountRow, headingRow, totalRow, unlinkedRow, type EntriesLinker, type StatementRow } from './statementRows';

const Labels = {
	assets: 'Assets',
	totalAssets: 'Total assets',
	liabilities: 'Liabilities',
	totalLiabilities: 'Total liabilities',
	equity: 'Equity',
	retainedEarnings: 'Retained earnings',
	totalEquity: 'Total equity',
	claimsOnAssets: 'Liabilities and equity'
} as const;

/** What is owned, then owed, then invested with the profit kept, each account opening every entry to the day. */
export function balanceSheetRows(sheet: BalanceSheet, linkEntries: EntriesLinker): StatementRow[] {
	const span = { start: null, end: sheet.asAt };
	const balanceRow = (balance: AccountBalance) => linkedBalanceRow(balance, span, linkEntries);
	const claimsOnAssets = sumMoney([sheet.totalLiabilities, sheet.totalEquity]);
	return [
		headingRow(Labels.assets),
		...sheet.assets.map(balanceRow),
		totalRow(Labels.totalAssets, [sheet.totalAssets]),
		headingRow(Labels.liabilities),
		...sheet.liabilities.map(balanceRow),
		totalRow(Labels.totalLiabilities, [sheet.totalLiabilities]),
		headingRow(Labels.equity),
		...sheet.equity.map(balanceRow),
		unlinkedRow(Labels.retainedEarnings, sheet.retainedEarnings),
		totalRow(Labels.totalEquity, [sheet.totalEquity]),
		totalRow(Labels.claimsOnAssets, [claimsOnAssets])
	];
}

function linkedBalanceRow(balance: AccountBalance, span: EntriesSpan, linkEntries: EntriesLinker): StatementRow {
	return accountRow(balance, [{ amount: balance.balance, href: linkEntries(balance.accountCode, span) }]);
}
