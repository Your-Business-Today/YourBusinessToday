import type { MonthKey } from '../monthKey';
import type { CostShareMembersByChoice } from './costShareMembersBy';
import type { CostShareSplitByChoice, UsageReadings } from './costShareUsage';

/** The limits books_cost_shares holds a shared cost to, stated once for the service and any form (migration 0291). */
export const CostShareLimits = { fewestMonthsCovered: 1, mostMonthsCovered: 36 } as const;

/**
 * One project's place in a shared cost: from the month it joins, and to the month it leaves, null while it carries on,
 * with the weight its part is reckoned by, such as the seats it uses; a member with no weight set takes an equal part.
 */
export type CostShareMember = { id: string; projectId: string | null; joinedMonth: MonthKey; leftMonth: MonthKey | null; weight?: number };

/**
 * A cost centre whose lines several projects share: each line is spread over the months it covers, counted from the
 * month it is dated, and each month's part is split among the projects sharing it that month by their weights: the projects named
 * as its members, or, kept by rule, every project live that month. Split by usage, each month goes by that month's readings.
 */
export type CostShare = {
	id: string;
	costCentreId: string;
	monthsCovered: number;
	membersBy: CostShareMembersByChoice;
	members: CostShareMember[];
	splitBy?: CostShareSplitByChoice;
	usage?: UsageReadings;
};

/** Whether the member shares the cost in the month: on or after the month it joined, and no later than the one it left. */
export function isSharingIn(member: CostShareMember, month: MonthKey): boolean {
	const hasJoined = member.joinedMonth <= month;
	const hasNotLeft = member.leftMonth === null || month <= member.leftMonth;
	return hasJoined && hasNotLeft;
}
