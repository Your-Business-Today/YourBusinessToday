/** The limits books_cost_share_members holds a weight to, stated once for the service and any form (migration 0294). */
export const CostShareWeightLimits = { largestWeight: 1000000, decimalPlaces: 4 } as const;

/** The weight of a member that has none set: every such member takes an equal part. */
export const equalWeight = 1;

const floatingPointSlack = 1e-6;

/** Why the value is not a weight a member can carry, or null when it is one: above nothing, at most a million, to four decimal places. */
export function weightRefusal(candidate: unknown): string | null {
	const { largestWeight, decimalPlaces } = CostShareWeightLimits;
	const isNumber = typeof candidate === 'number' && Number.isFinite(candidate);
	if (isNumber && candidate > 0 && candidate <= largestWeight && hasDecimalPlaces(candidate, decimalPlaces)) return null;
	return `weight is a number above 0 and at most ${largestWeight}, to ${decimalPlaces} decimal places, such as 3 for three seats; ${JSON.stringify(candidate)} was given.`;
}

function hasDecimalPlaces(weight: number, decimalPlaces: number): boolean {
	const scaled = weight * 10 ** decimalPlaces;
	return Math.abs(scaled - Math.round(scaled)) < floatingPointSlack;
}
