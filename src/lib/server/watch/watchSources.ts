import { accountsFiledSource } from './accountsFiledSource';
import { billingSchedulesSource } from './billingSchedulesSource';
import { cashScreensSource } from './cashScreensSource';
import { chatbotRecordKeepingSource } from './chatbotRecordKeepingSource';
import { connectorSelfCheckSource } from './connectorSelfCheckSource';
import { deployWindowsSource } from './deployWindowsSource';
import { filingsSource } from './filingsSource';
import { fillTerritoriesSource } from './fillTerritoriesSource';
import { foodHygieneSource } from './foodHygieneSource';
import { gazetteNoticesSource } from './gazetteNoticesSource';
import { geocodeRegisterSource } from './geocodeRegisterSource';
import { heartbeatSource } from './heartbeatSource';
import { registerWatchSource } from './registerWatchSource';
import { tradingPlacesSource } from './tradingPlacesSource';
import type { WatchSource } from './watchSource';

/** Every watcher the cron door knows by name; a name not here is refused. */
export const watchSources: WatchSource[] = [heartbeatSource, geocodeRegisterSource, foodHygieneSource, accountsFiledSource, gazetteNoticesSource, registerWatchSource, filingsSource, deployWindowsSource, connectorSelfCheckSource, billingSchedulesSource, cashScreensSource, fillTerritoriesSource, tradingPlacesSource, chatbotRecordKeepingSource];

/** The watcher a request names, or null: the one value the door accepts from outside is checked against this list. */
export function validateWatchSourceName(name: string): WatchSource | null {
	return watchSources.find((source) => source.name === name) ?? null;
}
