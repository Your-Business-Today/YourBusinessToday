import { fromPence, toPence } from '../money';
import { unlinedEntriesOf, type BankAccountSide, type UnlinedEntry } from './unlinedEntries';

/** A statement line as a reconciliation reads it: its day, its amount, the balance the statement gives after it, and its match. */
export type ReconcilingLine = { date: string; amount: number; balanceAfter: number | null; matchedJournalId: string | null };

/** The statement lines not yet matched to the day: how many, and the money they bring in and take out. */
export type UnmatchedLines = { count: number; moneyIn: number; moneyOut: number };

/**
 * Whether the bank agrees with its statement on a day: the statement's balance, null when no line gives one; the books'
 * balance of the account, money in less money out; the difference between them; the lines still to be matched; the
 * entries no line is matched to; and whether all three come to nothing.
 */
export type BankReconciliation = {
	asAt: string;
	statementBalance: number | null;
	booksBalance: number;
	difference: number | null;
	unmatchedLines: UnmatchedLines;
	unlinedEntries: UnlinedEntry[];
	isReconciled: boolean;
};

const nothing = 0;

/** The reconciliation on the day, from the account's statement lines in the statement's order and its sides in the books. */
export function buildBankReconciliation(asAt: string, lines: ReconcilingLine[], sides: BankAccountSide[]): BankReconciliation {
	const linesToTheDay = lines.filter((line) => line.date <= asAt);
	const sidesToTheDay = sides.filter((side) => side.journalDate <= asAt);
	const statementBalance = statementBalanceOf(linesToTheDay);
	const booksBalance = fromPence(sidesToTheDay.reduce((total, side) => total + toPence(side.debit) - toPence(side.credit), nothing));
	const difference = statementBalance === null ? null : fromPence(toPence(statementBalance) - toPence(booksBalance));
	const unmatchedLines = unmatchedLinesOf(linesToTheDay);
	const unlinedEntries = unlinedEntriesOf(sidesToTheDay, matchedJournalIdsOf(lines));
	const isReconciled = difference !== null && toPence(difference) === nothing && unmatchedLines.count === nothing && unlinedEntries.length === nothing;
	return { asAt, statementBalance, booksBalance, difference, unmatchedLines, unlinedEntries, isReconciled };
}

/** The balance after the last line, carried on from the last line that gives one by the amounts of the lines after it. */
function statementBalanceOf(lines: ReconcilingLine[]): number | null {
	const lastGivenAt = lines.findLastIndex((line) => line.balanceAfter !== null);
	const lastGiven = lines[lastGivenAt];
	if (lastGiven === undefined) return null;
	const linesAfter = lines.slice(lastGivenAt + 1);
	const balancePence = linesAfter.reduce((total, line) => total + toPence(line.amount), toPence(lastGiven.balanceAfter as number));
	return fromPence(balancePence);
}

function unmatchedLinesOf(lines: ReconcilingLine[]): UnmatchedLines {
	const unmatched = lines.filter((line) => line.matchedJournalId === null);
	const inPence = unmatched.filter((line) => line.amount > nothing).reduce((total, line) => total + toPence(line.amount), nothing);
	const outPence = unmatched.filter((line) => line.amount < nothing).reduce((total, line) => total - toPence(line.amount), nothing);
	return { count: unmatched.length, moneyIn: fromPence(inPence), moneyOut: fromPence(outPence) };
}

function matchedJournalIdsOf(lines: ReconcilingLine[]): Set<string> {
	return new Set(lines.flatMap((line) => (line.matchedJournalId === null ? [] : [line.matchedJournalId])));
}
