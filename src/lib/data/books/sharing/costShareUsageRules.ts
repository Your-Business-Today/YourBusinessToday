import { CostShareSplitBy } from './costShareUsage';

/** The limits books_cost_share_usage holds a reading to, stated once for the service and any form (migration 0295). */
export const CostShareUsageLimits = { largestUsage: 1000000000, decimalPlaces: 4, mostReadings: 200 } as const;

const splitChoices: readonly string[] = Object.values(CostShareSplitBy);
const floatingPointSlack = 1e-6;

/** Why the value is not a way of splitting a shared cost's months, or null when it is one. */
export function splitByRefusal(candidate: unknown): string | null {
	if (typeof candidate === 'string' && splitChoices.includes(candidate)) return null;
	return `splitBy is one of ${splitChoices.join(' or ')}; ${JSON.stringify(candidate)} was given.`;
}

/** Why the value is not a usage reading, or null when it is one: nothing or more, at most a thousand million, to four decimal places. */
export function usageRefusal(candidate: unknown): string | null {
	const { largestUsage, decimalPlaces } = CostShareUsageLimits;
	const isNumber = typeof candidate === 'number' && Number.isFinite(candidate);
	const scaled = isNumber ? candidate * 10 ** decimalPlaces : Number.NaN;
	const isPrecise = Math.abs(scaled - Math.round(scaled)) < floatingPointSlack;
	if (isNumber && candidate >= 0 && candidate <= largestUsage && isPrecise) return null;
	return `usage is a number from 0 to ${largestUsage}, to ${decimalPlaces} decimal places, such as 12.03 for $12.03 of usage; ${JSON.stringify(candidate)} was given.`;
}
