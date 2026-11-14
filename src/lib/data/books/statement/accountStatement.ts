import { naturalMovement } from '../reports/accountBalances';
import { sumMoney } from '../money';
import { isBeforePeriod, type StatementPeriod } from './statementPeriod';
import { byPostedMoment, postedAtOnce } from './postingMoment';
import type { JournalKind } from '../journalKinds';
import type { LedgerAccountType } from '../ledgerAccountTypes';

/** The account a statement explains. */
export type StatementAccount = { id: string; code: string; name: string; accountType: LedgerAccountType };

/** One posted line on the account, with the journal it belongs to and the moment that journal was posted. */
export type StatementEntry = {
	journalId: string;
	journalDate: string;
	postedAt: string;
	description: string;
	kind: JournalKind;
	costCentreId: string | null;
	debit: number;
	credit: number;
	position: number;
};

/** A line of the statement, with the account's balance once it is posted. */
export type StatementLine = StatementEntry & { balance: number };

/** An account's figure to the day, explained by every entry behind it: what it opened at, each line, what it closed at. */
export type AccountStatement = {
	account: StatementAccount;
	period: StatementPeriod;
	openingBalance: number;
	lines: StatementLine[];
	closingBalance: number;
};

/** The statement of an account over the period, from entries posted on or before its last day, balances on the natural side. */
export function buildAccountStatement(account: StatementAccount, entries: StatementEntry[], period: StatementPeriod): AccountStatement {
	const posted = entries.filter((entry) => entry.journalDate <= period.end).sort(byPostingOrder);
	const earlier = posted.filter((entry) => isBeforePeriod(entry.journalDate, period));
	const within = posted.filter((entry) => !isBeforePeriod(entry.journalDate, period));
	const openingBalance = sumMoney(earlier.map((entry) => movementOf(account, entry)));
	const lines = withRunningBalance(account, within, openingBalance);
	const closingBalance = lines.at(-1)?.balance ?? openingBalance;
	return { account, period, openingBalance, lines, closingBalance };
}

function withRunningBalance(account: StatementAccount, entries: StatementEntry[], openingBalance: number): StatementLine[] {
	let balance = openingBalance;
	return entries.map((entry) => {
		balance = sumMoney([balance, movementOf(account, entry)]);
		return { ...entry, balance };
	});
}

function movementOf(account: StatementAccount, entry: StatementEntry): number {
	return naturalMovement(account.accountType, entry.debit, entry.credit);
}

function byPostingOrder(first: StatementEntry, second: StatementEntry): number {
	if (first.journalDate !== second.journalDate) return first.journalDate.localeCompare(second.journalDate);
	const postingGap = byPostedMoment(first.postedAt, second.postedAt);
	if (postingGap !== postedAtOnce) return postingGap;
	if (first.journalId !== second.journalId) return first.journalId.localeCompare(second.journalId);
	return first.position - second.position;
}
