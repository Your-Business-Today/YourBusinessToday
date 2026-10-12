import { sweepFilings } from '$lib/server/register/sweepFilings';
import type { WatchSource } from './watchSource';

export const filingsSourceName = 'filings';

/** Every new filing by a register company and any change to its standing, within a week, when the key exists. */
export const filingsSource: WatchSource = {
	name: filingsSourceName,
	summary: 'reads the filing history and profile of the register companies longest unchecked and tells the feed what is new',
	run: sweepFilings
};
