import { validateMonthKey, type MonthKey } from '../monthKey';
import { CostShareLimits, type CostShareMember } from './costShare';

/** Why the months each line covers do not fit books_cost_shares.months_covered, or null when they do. */
export function monthsCoveredRefusal(candidate: unknown): string | null {
	const { fewestMonthsCovered, mostMonthsCovered } = CostShareLimits;
	const isWholeMonths = Number.isInteger(candidate);
	const isWithinLimits = isWholeMonths && (candidate as number) >= fewestMonthsCovered && (candidate as number) <= mostMonthsCovered;
	if (isWithinLimits) return null;
	return `monthsCovered is a whole number of months from ${fewestMonthsCovered} to ${mostMonthsCovered}, such as 12 for a yearly licence; ${JSON.stringify(candidate)} was given.`;
}

/** Why the months a member shares from and to cannot be kept, or null when they can: real months, the last no earlier than the first. */
export function memberMonthsRefusal(joinedMonth: unknown, leftMonth: unknown): string | null {
	const joinedRefusal = validateMonthKey('joinedMonth', joinedMonth);
	if (joinedRefusal !== null) return joinedRefusal;
	return leftMonthRefusal(joinedMonth as MonthKey, leftMonth);
}

/** Why the month a member leaves cannot be kept against the month it joined, or null when it can; null leaves it carrying on. */
export function leftMonthRefusal(joinedMonth: MonthKey, leftMonth: unknown): string | null {
	if (leftMonth === null) return null;
	const leftRefusal = validateMonthKey('leftMonth', leftMonth);
	if (leftRefusal !== null) return leftRefusal;
	if ((leftMonth as MonthKey) >= joinedMonth) return null;
	return `leftMonth cannot come before joinedMonth; ${leftMonth} is before ${joinedMonth}.`;
}

/** Whether two spells of sharing have a month in common. */
export function spellsOverlap(first: Pick<CostShareMember, 'joinedMonth' | 'leftMonth'>, second: Pick<CostShareMember, 'joinedMonth' | 'leftMonth'>): boolean {
	const firstEndsBeforeSecond = first.leftMonth !== null && first.leftMonth < second.joinedMonth;
	const secondEndsBeforeFirst = second.leftMonth !== null && second.leftMonth < first.joinedMonth;
	return !firstEndsBeforeSecond && !secondEndsBeforeFirst;
}
