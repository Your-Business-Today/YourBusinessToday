import { formatPoundsAndPence } from '$lib/data/books/money';
import { whatIsOwed } from '$lib/data/books/loans/whatIsOwed';
import type { LoanStatement, LoanStatementLine } from '$lib/data/books/loans/loanStatement';
import type { OverdrawnStretch } from '$lib/data/books/loans/overdrawnStretches';
import type { YearEndBalance } from '$lib/data/books/loans/financialYearEnds';
import type { LoanAccount } from '$lib/server/books/loanAccounts';
import { mostStatementLinesShown } from './describeAccountStatement';

export function describeLoanStatement(organisationName: string, loan: LoanAccount, statement: LoanStatement): string {
	const { lines } = statement;
	const shown = lines.slice(0, mostStatementLinesShown);
	return [
		`${loan.personName}'s loan account (${loan.relationship}) in ${organisationName}'s books: ${loan.accountCode} ${loan.accountName}.`,
		`Each entry from the start of the books to the end of ${statement.throughDate}, and the balance after it:`,
		...entryLines(shown),
		...unshownLines(lines.length - shown.length),
		`Put in ${formatPoundsAndPence(statement.totalIn)}; taken out ${formatPoundsAndPence(statement.totalOut)}.`,
		`Balance ${formatPoundsAndPence(statement.balance)}: ${whatIsOwed(loan.personName, statement.balance)}.`,
		...stretchLines(loan.personName, statement.overdrawnStretches),
		...yearEndLines(loan.personName, statement.yearEnds)
	].join('\n');
}

function unshownLines(unshownCount: number): string[] {
	if (unshownCount <= 0) return [];
	return [`- ${unshownCount} more entries are not listed; the totals and the balance count them all.`];
}

function entryLines(lines: LoanStatementLine[]): string[] {
	if (lines.length === 0) return ['- No entries yet.'];
	return lines.map((line) => `- ${line.journalDate} ${line.description}: ${movementText(line)}, balance ${formatPoundsAndPence(line.balance)}`);
}

function movementText(line: LoanStatementLine): string {
	if (line.moneyIn !== 0) return `in ${formatPoundsAndPence(line.moneyIn)}`;
	return `out ${formatPoundsAndPence(line.moneyOut)}`;
}

function stretchLines(personName: string, stretches: OverdrawnStretch[]): string[] {
	if (stretches.length === 0) return [`Never overdrawn: ${personName} has not owed the company at the end of any day.`];
	return [`Overdrawn, when ${personName} owed the company:`, ...stretches.map(stretchLine)];
}

function stretchLine(stretch: OverdrawnStretch): string {
	const mostOwed = formatPoundsAndPence(stretch.mostOwed);
	if (stretch.to === null) return `- from ${stretch.from}, and still overdrawn; the most owed was ${mostOwed}`;
	return `- from ${stretch.from} until ${stretch.to}; the most owed was ${mostOwed}`;
}

function yearEndLines(personName: string, yearEnds: YearEndBalance[]): string[] {
	if (yearEnds.length === 0) return ['No financial year has ended since the first entry.'];
	return ['At each financial year end:', ...yearEnds.map((yearEnd) => `- ${yearEnd.yearEnd}: ${whatIsOwed(personName, yearEnd.balance)}`)];
}
