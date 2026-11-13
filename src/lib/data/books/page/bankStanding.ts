import { formatBritishDate } from '$lib/data/britishDate';
import { formatPoundsAndPence } from '../money';
import type { BankReconciliation } from '../reconciliation/bankReconciliation';

const none = 0;
const one = 1;

/** Where the bank stands, in the Bank page's one line: reconciled to a day, or what is left to match and both balances. */
export function describeBankPageStanding(standing: BankReconciliation | null): string {
	if (standing === null) return 'No bank statement has been brought in yet. Your Claude brings one in through the Your Business Today connector.';
	const day = formatBritishDate(standing.asAt);
	if (standing.isReconciled) return `Reconciled to ${day}.`;
	return [whatIsLeftToMatch(standing, day), bothBalancesOf(standing)].filter((sentence) => sentence !== '').join(' ');
}

function whatIsLeftToMatch({ unmatchedLines }: BankReconciliation, day: string): string {
	const { count } = unmatchedLines;
	if (count === none) return `Every line is matched, but the bank does not agree with the statement at ${day}.`;
	return `${count} ${count === one ? 'line' : 'lines'} to match.`;
}

function bothBalancesOf({ statementBalance, booksBalance }: BankReconciliation): string {
	if (statementBalance === null) return '';
	return `The statement says ${formatPoundsAndPence(statementBalance)} and the books ${formatPoundsAndPence(booksBalance)}.`;
}
