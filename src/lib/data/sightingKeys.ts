export const sightingKeyPrefix = 'sighting:';

/** A sighting's pin is keyed by its id behind a prefix, so the sidebar knows which panel to draw. */
export function sightingIdOfKey(key: string): string | null {
	if (!key.startsWith(sightingKeyPrefix)) return null;
	return key.slice(sightingKeyPrefix.length);
}
