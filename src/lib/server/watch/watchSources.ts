import { accountsFiledSource } from './accountsFiledSource';
import { foodHygieneSource } from './foodHygieneSource';
import { gazetteNoticesSource } from './gazetteNoticesSource';
import { geocodeRegisterSource } from './geocodeRegisterSource';
import { heartbeatSource } from './heartbeatSource';
import type { WatchSource } from './watchSource';

/** Every watcher the cron door knows by name; a name not here is refused. */
export const watchSources: WatchSource[] = [heartbeatSource, geocodeRegisterSource, foodHygieneSource, accountsFiledSource, gazetteNoticesSource];

/** The watcher a request names, or null: the one value the door accepts from outside is checked against this list. */
export function validateWatchSourceName(name: string): WatchSource | null {
	return watchSources.find((source) => source.name === name) ?? null;
}
