import { differenceOf, formatPoundsAndPence, sumMoney, toPence } from '../money';
import type { LoanBudgetLine } from './loanBudget';

/** What has been spent from a line and what is left of its amount. */
export type LineSpending = { spent: number; left: number };

export function spendingOf(line: LoanBudgetLine): LineSpending {
	const spent = sumMoney(line.spends.map((spend) => spend.amount));
	return { spent, left: differenceOf(line.amount, spent) };
}

/** Why the amount may not be spent from the line: no director has approved it, or it would take the line past its amount. */
export function spendRefusal(line: LoanBudgetLine, amount: number): string | null {
	if (line.approval === null) return `${line.purpose} awaits a director’s approval, so nothing may be spent from it yet.`;
	const { left } = spendingOf(line);
	if (toPence(amount) <= toPence(left)) return null;
	return `That would take ${line.purpose} past its ${formatPoundsAndPence(line.amount)}; ${formatPoundsAndPence(left)} is left on it.`;
}

/** Why a line cannot come down to the amount given, once more than that has been spent from it, or null when it can. */
export function belowSpentRefusal(line: LoanBudgetLine, amount: number): string | null {
	const { spent } = spendingOf(line);
	if (toPence(amount) >= toPence(spent)) return null;
	return `${formatPoundsAndPence(spent)} has already been spent from ${line.purpose}, so it cannot come down to ${formatPoundsAndPence(amount)}.`;
}
