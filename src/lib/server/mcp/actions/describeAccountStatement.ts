import { formatPoundsAndPence } from '$lib/data/books/money';
import type { AccountStatement, StatementLine } from '$lib/data/books/statement/accountStatement';
import type { StatementPeriod } from '$lib/data/books/statement/statementPeriod';

/** The most lines an explanation lists, so one answer stays readable; a longer one asks for a shorter period. */
export const mostStatementLinesShown = 200;

export function describeAccountStatement(organisationName: string, statement: AccountStatement, costCentreId: string | null): string {
	const { account, period, lines } = statement;
	const shown = lines.slice(0, mostStatementLinesShown);
	return [
		`${account.code} ${account.name} (${account.accountType}) in ${organisationName}'s books${costCentreText(costCentreId)}:`,
		openingSentence(period, statement.openingBalance),
		...shown.map(statementLine),
		...unshownSentence(lines.length - shown.length),
		`Closing balance at the end of ${period.end}: ${formatPoundsAndPence(statement.closingBalance)}.`
	].join('\n');
}

function costCentreText(costCentreId: string | null): string {
	if (costCentreId === null) return '';
	return `, within cost centre ${costCentreId} alone`;
}

function openingSentence(period: StatementPeriod, openingBalance: number): string {
	if (period.start === null) return 'From the start of the books, each entry and the balance after it:';
	return `Opening balance before ${period.start}: ${formatPoundsAndPence(openingBalance)}. Then each entry and the balance after it:`;
}

function statementLine(line: StatementLine): string {
	const isDebit = line.debit !== 0;
	const side = isDebit ? `debit ${formatPoundsAndPence(line.debit)}` : `credit ${formatPoundsAndPence(line.credit)}`;
	const balance = formatPoundsAndPence(line.balance);
	return `- ${line.journalDate} ${line.description} (${line.kind}, journal ${line.journalId}): ${side}, balance ${balance}`;
}

function unshownSentence(unshownCount: number): string[] {
	if (unshownCount <= 0) return [];
	return [`- ${unshownCount} more entries are not listed: ask for a shorter period to see them. The closing balance counts them all.`];
}
