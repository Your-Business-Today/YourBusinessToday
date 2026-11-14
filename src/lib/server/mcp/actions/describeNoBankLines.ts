import { countOf } from '$lib/data/countOf';
import { formatBritishDate } from '$lib/data/britishDate';
import { BankLineMatchings } from '$lib/server/books/bankLines';
import type { BankLineReading } from '$lib/server/books/bankLineReading';
import type { StatementAccount } from '$lib/server/books/bankStatementAccount';
import { accountName } from './describeBankLines';

const none = 0;
const noDays = '';

/**
 * What an empty listing means, as asked: no line held on the account or in those days, every line there matched when
 * unmatched lines were asked for, or none matched yet when matched lines were.
 */
export function describeNoBankLines(organisationName: string, account: StatementAccount, reading: BankLineReading, heldCount: number): string {
	const where = `${organisationName}'s books hold on ${accountName(account)}${describeDays(reading)}`;
	const inAll = countOf(heldCount, 'line');
	if (heldCount === none) return describeNothingHeld(organisationName, account, reading);
	if (reading.matching === BankLineMatchings.unmatched) return `Every statement line ${where} is matched, ${inAll} in all.`;
	return `No statement line ${where} is matched yet, ${inAll} in all.`;
}

function describeNothingHeld(organisationName: string, account: StatementAccount, reading: BankLineReading): string {
	const opening = `${organisationName}'s books hold no statement lines on ${accountName(account)}`;
	const days = describeDays(reading);
	if (days === noDays) return `${opening} yet; import_bank_lines brings a statement in.`;
	return `${opening}${days}.`;
}

function describeDays({ from, to }: BankLineReading): string {
	if (from !== null && to !== null) return ` between ${formatBritishDate(from)} and ${formatBritishDate(to)}`;
	if (from !== null) return ` from ${formatBritishDate(from)} on`;
	if (to !== null) return ` up to ${formatBritishDate(to)}`;
	return noDays;
}
