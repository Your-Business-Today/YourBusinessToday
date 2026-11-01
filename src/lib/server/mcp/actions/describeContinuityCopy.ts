import { formatBritishDate } from '$lib/data/britishDate';
import type { ContinuityCopy } from '$lib/data/continuityCopy';

/** The continuity copy as a line of a client's record: connected or not, and opened or not, with who confirmed it. */
export function describeContinuityCopy(continuityCopy: ContinuityCopy): string {
	const { storageConnectedOn, copyOpenedOn, copyConfirmedBy } = continuityCopy;
	const connected = storageConnectedOn === null ? 'storage not connected yet' : `storage connected ${formatBritishDate(storageConnectedOn)}`;
	const opened = copyOpenedOn === null ? 'no copy opened yet' : `copy opened ${formatBritishDate(copyOpenedOn)}, confirmed by ${copyConfirmedBy}`;
	return `Continuity copy: ${connected}; ${opened}`;
}
