import { formatPoundsAndPence } from '$lib/data/books/money';
import type { TrialBalance, TrialBalanceLine } from '$lib/data/books/reports/trialBalance';

export function describeTrialBalance(organisationName: string, trialBalance: TrialBalance): string {
	const { lines, asAt } = trialBalance;
	if (lines.length === 0) return `${organisationName}'s books hold no balances at the end of ${asAt}.`;
	return [
		`Trial balance of ${organisationName} at the end of ${asAt}:`,
		...lines.map(trialBalanceLine),
		`- Total: debit ${formatPoundsAndPence(trialBalance.totalDebit)}, credit ${formatPoundsAndPence(trialBalance.totalCredit)}`,
		'',
		balanceSentence(trialBalance)
	].join('\n');
}

function trialBalanceLine(line: TrialBalanceLine): string {
	const isDebitBalance = line.debit !== 0;
	const side = isDebitBalance ? `debit ${formatPoundsAndPence(line.debit)}` : `credit ${formatPoundsAndPence(line.credit)}`;
	return `- ${line.accountCode} ${line.accountName} (${line.accountType}): ${side}`;
}

function balanceSentence(trialBalance: TrialBalance): string {
	if (trialBalance.isBalanced) return 'The debits equal the credits.';
	return 'The debits do not equal the credits, which posted journals never leave: say so to the person before relying on any figure.';
}
