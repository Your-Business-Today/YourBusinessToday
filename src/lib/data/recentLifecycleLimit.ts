export const recentLifecycleLimits = { fewest: 1, most: 200, usual: 50 } as const;

export const recentLifecycleLimitRefusal =
	`The limit is a whole number from ${recentLifecycleLimits.fewest} to ${recentLifecycleLimits.most}.`;

/** How many recent steps to read: the usual count when none is given, undefined when it does not fit. */
export function validateRecentLifecycleLimit(value: unknown): number | undefined {
	if (value === undefined || value === null) return recentLifecycleLimits.usual;
	if (typeof value !== 'number' || !Number.isInteger(value)) return undefined;
	const isTooFew = value < recentLifecycleLimits.fewest;
	const isTooMany = value > recentLifecycleLimits.most;
	if (isTooFew || isTooMany) return undefined;
	return value;
}
