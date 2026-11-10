import { journalKindLabels } from '../journalKindLabels';
import { amountOrBlank } from './blankAmount';
import type { AccountStatement, StatementLine } from '../statement/accountStatement';

/** One row of the entries behind a figure: the day, what the journal says, its kind, its side and the balance after it. */
export type AccountEntryRow = {
	key: string;
	journalDate: string;
	description: string;
	kindLabel: string;
	debit: number | null;
	credit: number | null;
	balance: number;
};

const openingRowKey = 'opening-balance';
const openingDescription = 'Opening balance';
const noKind = '';

/** The opening balance when the span has a first day, then each entry in the order it was posted. */
export function accountEntryRows(statement: AccountStatement): AccountEntryRow[] {
	const { period, lines, openingBalance } = statement;
	const entryRows = lines.map(entryRowOf);
	if (period.start === null) return entryRows;
	const openingRow = { key: openingRowKey, journalDate: period.start, description: openingDescription, kindLabel: noKind };
	return [{ ...openingRow, debit: null, credit: null, balance: openingBalance }, ...entryRows];
}

function entryRowOf(line: StatementLine): AccountEntryRow {
	return {
		key: `${line.journalId}-${line.position}`,
		journalDate: line.journalDate,
		description: line.description,
		kindLabel: journalKindLabels[line.kind],
		debit: amountOrBlank(line.debit),
		credit: amountOrBlank(line.credit),
		balance: line.balance
	};
}

