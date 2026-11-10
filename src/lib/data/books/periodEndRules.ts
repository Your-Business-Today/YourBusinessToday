import { validateRecordId } from '$lib/data/isUuid';
import { validateMoney } from './moneyColumn';
import { validateMonthKey, type MonthKey } from './monthKey';
import { toPence } from './money';
import type { ExpenseCost } from './expensePostings';

/** A cost month end posts: what it is for, the amount, and the expense account it is coded to, perhaps within a cost centre. */
export type PeriodEndCost = ExpenseCost & { description: string };

/** A cost incurred in the month and not yet billed. */
export type AccrualInput = PeriodEndCost & { monthKey: MonthKey };

/** A cost paid up front, with amount the whole of it, spread across the months it covers from the first. */
export type PrepaymentReleaseInput = PeriodEndCost & { firstMonthKey: MonthKey; monthCount: number };

/** yourbooks.today's limits on how many months one payment is spread across. */
export const releaseMonthLimits = { fewest: 1, most: 36 } as const;

const nothing = 0;

/** The accrual as given, or the first reason it cannot be posted: never rounded, trimmed or filled in. */
export function validateAccrual(fields: Record<string, unknown>): AccrualInput | string {
	const monthRefusal = validateMonthKey('monthKey', fields.monthKey);
	if (monthRefusal !== null) return monthRefusal;
	const cost = validatePeriodEndCost(fields, 'amount');
	if (typeof cost === 'string') return cost;
	return { ...cost, monthKey: fields.monthKey as MonthKey };
}

/** The prepayment's release as given, or the first reason it cannot be posted: a penny a month at least, never rounded. */
export function validatePrepaymentRelease(fields: Record<string, unknown>): PrepaymentReleaseInput | string {
	const monthRefusal = validateMonthKey('firstMonthKey', fields.firstMonthKey);
	if (monthRefusal !== null) return monthRefusal;
	const countRefusal = monthCountRefusal(fields.monthCount);
	if (countRefusal !== null) return countRefusal;
	const cost = validatePeriodEndCost(fields, 'totalAmount');
	if (typeof cost === 'string') return cost;
	const monthCount = fields.monthCount as number;
	if (toPence(cost.amount) < monthCount) return `totalAmount is at least a penny for each of the ${monthCount} months; ${cost.amount} was given.`;
	return { ...cost, firstMonthKey: fields.firstMonthKey as MonthKey, monthCount };
}

function validatePeriodEndCost(fields: Record<string, unknown>, amountField: string): PeriodEndCost | string {
	const refusal = costDetailRefusal(fields);
	if (refusal !== null) return refusal;
	const amount = validateMoney(amountField, fields[amountField]);
	if (typeof amount === 'string') return amount;
	if (amount === nothing) return `${amountField} is above zero; ${fields[amountField]} was given.`;
	return {
		description: fields.description as string,
		amount,
		expenseAccountId: fields.expenseAccountId as string,
		costCentreId: (fields.costCentreId ?? null) as string | null
	};
}

function costDetailRefusal(fields: Record<string, unknown>): string | null {
	const refusals = [
		descriptionRefusal(fields.description),
		validateRecordId('expense account', String(fields.expenseAccountId ?? '')),
		fields.costCentreId === undefined ? null : validateRecordId('cost centre', String(fields.costCentreId))
	];
	return refusals.find((refusal) => refusal !== null) ?? null;
}

function descriptionRefusal(description: unknown): string | null {
	const isDescribed = typeof description === 'string' && description.trim() !== '';
	if (isDescribed) return null;
	return 'description is needed: what the cost is for, in the words the person gave.';
}

function monthCountRefusal(monthCount: unknown): string | null {
	const isWholeCount = typeof monthCount === 'number' && Number.isInteger(monthCount);
	const isInRange = isWholeCount && monthCount >= releaseMonthLimits.fewest && monthCount <= releaseMonthLimits.most;
	if (isInRange) return null;
	return `monthCount is a whole number of months from ${releaseMonthLimits.fewest} to ${releaseMonthLimits.most}; ${JSON.stringify(monthCount)} was given.`;
}
