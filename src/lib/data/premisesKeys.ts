export const premisesKeyPrefix = 'premises:';

/** A premises' pin is keyed by its id behind a prefix, so the sidebar knows which panel to draw. */
export function premisesIdOfKey(key: string): string | null {
	if (!key.startsWith(premisesKeyPrefix)) return null;
	return key.slice(premisesKeyPrefix.length);
}
