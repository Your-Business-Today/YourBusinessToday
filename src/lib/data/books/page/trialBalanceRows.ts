import { amountOrBlank } from './blankAmount';
import type { TrialBalance, TrialBalanceLine } from '../reports/trialBalance';
import { accountRow, totalRow, type EntriesLinker, type StatementFigure, type StatementRow } from './statementRows';

const totalLabel = 'Total';

/** Each account's balance in its debit or credit column, opening every entry to the day, then the two totals. */
export function trialBalanceRows(trialBalance: TrialBalance, linkEntries: EntriesLinker): StatementRow[] {
	const span = { start: null, end: trialBalance.asAt };
	const lines = trialBalance.lines.map((line) => lineRow(line, linkEntries(line.accountCode, span)));
	return [...lines, totalRow(totalLabel, [trialBalance.totalDebit, trialBalance.totalCredit])];
}

function lineRow(line: TrialBalanceLine, href: string): StatementRow {
	return accountRow(line, [columnFigure(line.debit, href), columnFigure(line.credit, href)]);
}

function columnFigure(amount: number, href: string): StatementFigure {
	return { amount: amountOrBlank(amount), href };
}
