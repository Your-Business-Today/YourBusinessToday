import type { MonthKey } from '../monthKey';
import type { CostShare, CostShareMember } from './costShare';
import { equalWeight } from './costShareWeights';

/** How a shared cost's months are split: by the members' weights, equal where none is set, or by each month's usage readings. */
export const CostShareSplitBy = { weight: 'weight', usage: 'usage' } as const;

export type CostShareSplitByChoice = (typeof CostShareSplitBy)[keyof typeof CostShareSplitBy];

/** Each month's usage readings of a shared cost, by month and then by the member's project, or its cost centre when it has none. */
export type UsageReadings = Map<MonthKey, Map<string, number>>;

/** The weights a month's part is split by among the members sharing it: their usage that month, their weights, or equal. */
export function partWeightsOf(share: CostShare, sharing: CostShareMember[], month: MonthKey): number[] {
	if (sharing.length === 0) return [equalWeight];
	if (share.splitBy !== CostShareSplitBy.usage) return sharing.map((member) => member.weight ?? equalWeight);
	const usage = sharing.map((member) => usageOf(share, month, member));
	const isAnyUsed = usage.some((reading) => reading > 0);
	return isAnyUsed ? usage : sharing.map(() => equalWeight);
}

/** Whether a month of a cost split by usage has no reading for any project sharing it, and so is split equally instead. */
export function isSplitEquallyWithoutUsage(share: CostShare, sharing: CostShareMember[], month: MonthKey): boolean {
	if (share.splitBy !== CostShareSplitBy.usage || sharing.length === 0) return false;
	return sharing.every((member) => usageOf(share, month, member) === 0);
}

/** The key a member's usage reading is kept by: its project, or its cost centre when it has no project. */
export function usageKeyOf(member: Pick<CostShareMember, 'projectId' | 'costCentreId'>): string | null {
	return member.projectId ?? member.costCentreId ?? null;
}

function usageOf(share: CostShare, month: MonthKey, member: CostShareMember): number {
	const key = usageKeyOf(member);
	if (key === null) return 0;
	const readings = share.usage?.get(month);
	return readings?.get(key) ?? 0;
}
