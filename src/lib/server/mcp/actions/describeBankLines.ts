import { formatBritishDate } from '$lib/data/britishDate';
import { formatPoundsAndPence } from '$lib/data/books/money';
import type { BalanceCheck } from '$lib/data/books/bankBalanceCheck';
import type { BankLine } from '$lib/server/books/bankLines';
import type { BankLineImport } from '$lib/server/books/importBankLines';
import type { StatementAccount } from '$lib/server/books/bankStatementAccount';

const none = 0;
const leftOut = '';

/** What bringing the statement in did, in the person's terms: the account, what was new, its days and its balances. */
export function describeBankLineImport(organisationName: string, imported: BankLineImport): string {
	const kept = `${imported.addedCount} added, ${imported.alreadyThereCount} already there`;
	const days = `The lines run from ${formatBritishDate(imported.firstDate)} to ${formatBritishDate(imported.lastDate)}.`;
	const opening = `Brought the statement into ${organisationName}'s books on ${accountName(imported.account)}: ${kept}.`;
	return [opening, days, describeBalances(imported.balances)].join(' ');
}

/** The account's statement lines in the statement's order, each on one line with its id and whether it is matched. */
export function describeBankLineList(organisationName: string, account: StatementAccount, lines: BankLine[]): string {
	const name = accountName(account);
	if (lines.length === none) return `${organisationName}'s books hold no statement lines on ${name} that match.`;
	const unmatchedCount = lines.filter((line) => line.matchedJournalId === null).length;
	const heading = `Statement lines of ${organisationName} on ${name}, in the statement's order. ${lines.length} shown, ${unmatchedCount} unmatched.`;
	return [heading, ...lines.map(describeBankLine)].join('\n');
}

/** The account the statement is of, by its code and name. */
export function accountName(account: StatementAccount): string {
	return `${account.code} ${account.name}`;
}

function describeBankLine(line: BankLine): string {
	const details = [line.reference, line.kind].filter((detail) => detail !== leftOut).join(', ');
	const described = details === leftOut ? line.counterparty : `${line.counterparty}, ${details}`;
	const balance = line.balanceAfter === null ? leftOut : `, balance ${formatPoundsAndPence(line.balanceAfter)}`;
	const matched = line.matchedJournalId === null ? 'unmatched' : `matched to journal ${line.matchedJournalId}`;
	return `- ${formatBritishDate(line.date)}: ${described}, ${formatPoundsAndPence(line.amount)}${balance}; ${matched}. Id ${line.id}`;
}

function describeBalances(balances: BalanceCheck): string {
	const { checkedCount, disagreement } = balances;
	if (checkedCount === none) return 'No two lines in a row gave a balance, so none was checked.';
	if (disagreement === null) return `The balances given agree with the amounts (${checkedCount} checked).`;
	const { lineNumber, balanceAfter, previousBalance, amount } = disagreement;
	return (
		`The balances given do not agree with the amounts: line ${lineNumber}'s balance ${formatPoundsAndPence(balanceAfter)} is not ` +
		`the ${formatPoundsAndPence(previousBalance)} above it plus its ${formatPoundsAndPence(amount)}. ` +
		'Check that line against the statement with the person; the lines are kept as given.'
	);
}
