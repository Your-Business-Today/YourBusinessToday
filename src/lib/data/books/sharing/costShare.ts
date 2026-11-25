import type { MonthKey } from '../monthKey';

/** The limits books_cost_shares holds a shared cost to, stated once for the service and any form (migration 0291). */
export const CostShareLimits = { fewestMonthsCovered: 1, mostMonthsCovered: 36 } as const;

/** One project's place in a shared cost: from the month it joins, and to the month it leaves, null while it carries on. */
export type CostShareMember = { id: string; projectId: string | null; joinedMonth: MonthKey; leftMonth: MonthKey | null };

/**
 * A cost centre whose lines several projects share: each line is spread over the months it covers, counted from the
 * month it is dated, and each month's part is split equally among the projects sharing it that month.
 */
export type CostShare = { id: string; costCentreId: string; monthsCovered: number; members: CostShareMember[] };

/** Whether the member shares the cost in the month: on or after the month it joined, and no later than the one it left. */
export function isSharingIn(member: CostShareMember, month: MonthKey): boolean {
	const hasJoined = member.joinedMonth <= month;
	const hasNotLeft = member.leftMonth === null || month <= member.leftMonth;
	return hasJoined && hasNotLeft;
}
