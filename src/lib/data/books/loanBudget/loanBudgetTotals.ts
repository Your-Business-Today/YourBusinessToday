import { differenceOf, formatPoundsAndPence, sumMoney, toPence } from '../money';
import type { LoanBudget } from './loanBudget';

/** What the lines and the draws of a budget come to, and what is left of the loan for each. */
export type LoanBudgetTotals = { budgeted: number; approved: number; unbudgeted: number; drawn: number; undrawn: number };

/** A part of the loan held against it: a line budgeted or a draw, by its id and amount. */
type LoanShare = { id: string; amount: number };

export function totalsOf(budget: LoanBudget): LoanBudgetTotals {
	const budgeted = sumMoney(budget.lines.map((line) => line.amount));
	const approved = sumMoney(budget.lines.filter((line) => line.approval !== null).map((line) => line.amount));
	const drawn = sumMoney(budget.draws.map((draw) => draw.amount));
	return { budgeted, approved, unbudgeted: differenceOf(budget.loanAmount, budgeted), drawn, undrawn: differenceOf(budget.loanAmount, drawn) };
}

/** Why the lines would come to more than the loan once one line is the amount given, or null when they fit. */
export function overBudgetRefusal(budget: LoanBudget, lineAmount: number, replacedLineId: string | null): string | null {
	return pastTheLoanRefusal(budget, { shares: budget.lines, amount: lineAmount, replacedId: replacedLineId, noun: 'lines', verb: 'budget' });
}

/** Why the draws would come to more than the loan once one draw is the amount given, or null when they fit. */
export function overDrawnRefusal(budget: LoanBudget, drawAmount: number, replacedDrawId: string | null): string | null {
	return pastTheLoanRefusal(budget, { shares: budget.draws, amount: drawAmount, replacedId: replacedDrawId, noun: 'draws', verb: 'draw' });
}

type ShareCheck = { shares: LoanShare[]; amount: number; replacedId: string | null; noun: string; verb: string };

function pastTheLoanRefusal(budget: LoanBudget, check: ShareCheck): string | null {
	const others = check.shares.filter((share) => share.id !== check.replacedId).map((share) => share.amount);
	const total = sumMoney([...others, check.amount]);
	if (toPence(total) <= toPence(budget.loanAmount)) return null;
	const left = formatPoundsAndPence(differenceOf(budget.loanAmount, sumMoney(others)));
	const loan = formatPoundsAndPence(budget.loanAmount);
	return `The ${check.noun} of ${budget.title} cannot come to more than the loan of ${loan}; ${left} is left to ${check.verb}.`;
}
