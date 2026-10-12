import { watchRegister } from '$lib/server/register/watchRegister';
import type { WatchSource } from './watchSource';

export const registerWatchSourceName = 'register';

/** Companies incorporated, dissolved or in trouble in a patch since yesterday, from Companies House, when the key exists. */
export const registerWatchSource: WatchSource = {
	name: registerWatchSourceName,
	summary: 'asks Companies House for the companies incorporated, dissolved or in trouble in every patch outcode since the last check',
	run: watchRegister
};
