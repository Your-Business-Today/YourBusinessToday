import { formatBritishDate } from '$lib/data/britishDate';
import { formatPoundsAndPence } from '../money';
import type { LoanStatement, LoanStatementLine } from '../loans/loanStatement';
import type { OverdrawnStretch } from '../loans/overdrawnStretches';

/** An entry on a person's statement as the Loans page shows it, marked when it falls in a stretch the account was overdrawn. */
export type LoanStatementRow = LoanStatementLine & { key: string; isOverdrawn: boolean };

/** The statement's entries in posting order, each marked when its day falls in a stretch the person owed the company. */
export function loanStatementRowsOf(statement: LoanStatement): LoanStatementRow[] {
	return statement.lines.map((line, position) => ({
		...line,
		key: String(position),
		isOverdrawn: statement.overdrawnStretches.some((stretch) => isInStretch(line.journalDate, stretch))
	}));
}

function isInStretch(day: string, stretch: OverdrawnStretch): boolean {
	const hasEndedBy = stretch.to !== null && day >= stretch.to;
	return day >= stretch.from && !hasEndedBy;
}

/** A stretch the account was overdrawn, in one line: from when, to when or still, and the most the person owed in it. */
export function describeOverdrawnStretch(stretch: OverdrawnStretch): string {
	const mostOwed = formatPoundsAndPence(stretch.mostOwed);
	const from = formatBritishDate(stretch.from);
	if (stretch.to === null) return `Overdrawn since ${from}, owing at most ${mostOwed}.`;
	return `Overdrawn from ${from} to ${formatBritishDate(stretch.to)}, owing at most ${mostOwed}.`;
}
