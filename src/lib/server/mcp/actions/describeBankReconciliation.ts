import { formatBritishDate } from '$lib/data/britishDate';
import { formatPoundsAndPence } from '$lib/data/books/money';
import type { BankReconciliation, UnmatchedLines } from '$lib/data/books/reconciliation/bankReconciliation';
import type { UnlinedEntry } from '$lib/data/books/reconciliation/unlinedEntries';
import type { AccountReconciliation } from '$lib/server/books/bankReconciliation';
import { accountName } from './describeBankLines';

const none = 0;
const one = 1;

/** Whether the bank agrees with its statement on the day, in the person's terms: both balances, the difference, and what is left to match. */
export function describeBankReconciliation(organisationName: string, { account, reconciliation }: AccountReconciliation): string {
	const day = formatBritishDate(reconciliation.asAt);
	return [
		`Bank reconciliation of ${organisationName}'s books on ${accountName(account)} at the end of ${day}:`,
		...describeBalances(reconciliation),
		`- Lines not yet matched: ${describeUnmatchedLines(reconciliation.unmatchedLines)}`,
		...describeUnlinedEntries(reconciliation.unlinedEntries),
		'',
		describeVerdict(reconciliation, day)
	].join('\n');
}

/** The front page's one line on the books' Bank account: reconciled to the statement's last day, or how many lines are left to match. */
export function describeBankStanding(standing: BankReconciliation | null): string {
	if (standing === null) return 'No bank statement has been brought in yet.';
	const { count } = standing.unmatchedLines;
	if (count > none) return `${count} bank ${count === one ? 'line' : 'lines'} to match.`;
	const day = formatBritishDate(standing.asAt);
	if (standing.isReconciled) return `Bank reconciled to ${day}.`;
	return `Every bank line is matched, but the bank does not agree with the statement at ${day}; read_bank_reconciliation says why.`;
}

function describeBalances({ statementBalance, booksBalance, difference }: BankReconciliation): string[] {
	const books = `- Books: ${formatPoundsAndPence(booksBalance)}`;
	if (statementBalance === null || difference === null) {
		return ['- Statement: no line to that day gives a balance, so the difference cannot be read', books];
	}
	const differenceText = `- Difference, the statement less the books: ${formatPoundsAndPence(difference)}`;
	return [`- Statement: ${formatPoundsAndPence(statementBalance)}`, books, differenceText];
}

function describeUnmatchedLines({ count, moneyIn, moneyOut }: UnmatchedLines): string {
	if (count === none) return 'none';
	return `${count}, ${formatPoundsAndPence(moneyIn)} in and ${formatPoundsAndPence(moneyOut)} out; list_bank_lines with matching unmatched lists them`;
}

function describeUnlinedEntries(entries: UnlinedEntry[]): string[] {
	if (entries.length === none) return ['- Entries in the books no line is matched to: none'];
	const heading = `- Entries in the books no line is matched to: ${entries.length}, oldest first:`;
	const listed = entries.map((entry) => `  - ${formatBritishDate(entry.date)}: ${entry.description}, ${formatPoundsAndPence(entry.amount)}. Journal ${entry.journalId}`);
	return [heading, ...listed];
}

function describeVerdict(reconciliation: BankReconciliation, day: string): string {
	if (reconciliation.isReconciled) return `The bank is reconciled to ${day}.`;
	return (
		`The bank is not reconciled to ${day}. Match each line still unmatched with match_bank_line; an entry no line is ` +
		'matched to is either on a statement not brought in yet, or was posted to the bank by mistake.'
	);
}
