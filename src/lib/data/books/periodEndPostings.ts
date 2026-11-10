import type { JournalLineInput } from './journalLine';
import { fromPence, toPence } from './money';
import { describeMonth, shiftMonth, type MonthKey } from './monthKey';
import { creditOf, debitOf } from './postingSides';
import type { PeriodEndCost, PrepaymentReleaseInput } from './periodEndRules';

/** One month's share of a prepayment, released from Prepayments into its expense account at the month's end. */
export type MonthlyRelease = { monthKey: MonthKey; amount: number };

/** Accruing: the cost is debited to its expense account, within its cost centre, and owed on Accruals. */
export function accruedCostLines(cost: PeriodEndCost, accrualsAccountId: string): JournalLineInput[] {
	return [debitOf(cost.expenseAccountId, cost.amount, cost.costCentreId), creditOf(accrualsAccountId, cost.amount)];
}

/** Reversing next month: the same lines on the other sides, so the bill that arrives posts the cost once. */
export function accrualReversalLines(cost: PeriodEndCost, accrualsAccountId: string): JournalLineInput[] {
	return [debitOf(accrualsAccountId, cost.amount), creditOf(cost.expenseAccountId, cost.amount, cost.costCentreId)];
}

/** Releasing a month's share: Prepayments falls by it, and it is debited to the expense account within its cost centre. */
export function releasedShareLines(cost: PeriodEndCost, prepaymentsAccountId: string, amount: number): JournalLineInput[] {
	return [debitOf(cost.expenseAccountId, amount, cost.costCentreId), creditOf(prepaymentsAccountId, amount)];
}

/**
 * The whole amount in equal whole-penny shares, one for each month from the first; the last month carries the pence
 * left over, so the shares always add up to the amount paid and none is ever nothing.
 */
export function monthlyReleases(release: PrepaymentReleaseInput): MonthlyRelease[] {
	const totalPence = toPence(release.amount);
	const evenSharePence = Math.floor(totalPence / release.monthCount);
	const leftOverPence = totalPence - evenSharePence * release.monthCount;
	const lastMonthIndex = release.monthCount - 1;
	return Array.from({ length: release.monthCount }, (_, monthIndex) => {
		const sharePence = monthIndex === lastMonthIndex ? evenSharePence + leftOverPence : evenSharePence;
		return { monthKey: shiftMonth(release.firstMonthKey, monthIndex), amount: fromPence(sharePence) };
	});
}

export function accrualDescription(cost: PeriodEndCost): string {
	return `Accrual: ${cost.description}`;
}

export function accrualReversalDescription(cost: PeriodEndCost): string {
	return `Reversal of accrual: ${cost.description}`;
}

export function releaseDescription(cost: PeriodEndCost, monthKey: MonthKey): string {
	return `Prepayment release: ${cost.description} (${describeMonth(monthKey)})`;
}
