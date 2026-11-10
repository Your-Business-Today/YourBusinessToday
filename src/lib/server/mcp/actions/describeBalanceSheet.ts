import { formatPoundsAndPence } from '$lib/data/books/money';
import type { BalanceSheet } from '$lib/data/books/reports/balanceSheet';
import type { AccountBalance } from '$lib/data/books/reports/accountBalances';

export function describeBalanceSheet(organisationName: string, sheet: BalanceSheet): string {
	return [
		`Balance sheet of ${organisationName} at the end of ${sheet.asAt}:`,
		'',
		'Assets:',
		...balanceLines(sheet.assets),
		`- Total assets: ${formatPoundsAndPence(sheet.totalAssets)}`,
		'',
		'Liabilities:',
		...balanceLines(sheet.liabilities),
		`- Total liabilities: ${formatPoundsAndPence(sheet.totalLiabilities)}`,
		'',
		'Equity:',
		...balanceLines(sheet.equity),
		`- Retained earnings, every profit to date: ${formatPoundsAndPence(sheet.retainedEarnings)}`,
		`- Total equity: ${formatPoundsAndPence(sheet.totalEquity)}`,
		'',
		balanceSentence(sheet)
	].join('\n');
}

function balanceLines(balances: AccountBalance[]): string[] {
	if (balances.length === 0) return ['- None'];
	return balances.map((balance) => `- ${balance.accountCode} ${balance.accountName}: ${formatPoundsAndPence(balance.balance)}`);
}

function balanceSentence(sheet: BalanceSheet): string {
	if (sheet.isBalanced) return 'The assets equal the liabilities and equity together.';
	return 'The assets do not equal the liabilities and equity together: say so to the person before relying on any figure.';
}
