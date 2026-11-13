import { sumMoney } from '../money';
import type { StatementLine } from '../statement/accountStatement';
import { dayEndBalances } from './dayEndBalances';
import { overdrawnStretches, type OverdrawnStretch } from './overdrawnStretches';
import { yearEndBalances, type YearEndBalance } from './financialYearEnds';

/** An entry on a loan account: money the person put in, or money they took out, and what the account stood at after it. */
export type LoanStatementLine = {
	journalDate: string;
	description: string;
	moneyIn: number;
	moneyOut: number;
	balance: number;
};

/**
 * A loan account read from the ledger to a day: each entry, the totals in and out, the balance (above zero the company
 * owes the person, below zero the person owes the company), each stretch it was overdrawn, and each year end's balance.
 */
export type LoanStatement = {
	throughDate: string;
	lines: LoanStatementLine[];
	totalIn: number;
	totalOut: number;
	balance: number;
	overdrawnStretches: OverdrawnStretch[];
	yearEnds: YearEndBalance[];
};

/** The loan statement from the liability account's lines in posting order, each with the balance after it. */
export function buildLoanStatement(lines: StatementLine[], yearStartMonth: number, throughDate: string): LoanStatement {
	const loanLines = lines.map(toLoanLine);
	const dayEnds = dayEndBalances(lines);
	return {
		throughDate,
		lines: loanLines,
		totalIn: sumMoney(loanLines.map((line) => line.moneyIn)),
		totalOut: sumMoney(loanLines.map((line) => line.moneyOut)),
		balance: loanLines.at(-1)?.balance ?? 0,
		overdrawnStretches: overdrawnStretches(dayEnds),
		yearEnds: yearEndBalances(dayEnds, yearStartMonth, throughDate)
	};
}

function toLoanLine(line: StatementLine): LoanStatementLine {
	return {
		journalDate: line.journalDate,
		description: line.description,
		moneyIn: line.credit,
		moneyOut: line.debit,
		balance: line.balance
	};
}
