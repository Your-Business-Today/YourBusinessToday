import { sweepGazetteNotices } from '$lib/server/gazette/sweepGazetteNotices';
import type { WatchSource } from './watchSource';

export const gazetteNoticesSourceName = 'gazette_notices';

/** The Gazette's corporate insolvency notices for register companies, the day they are published. */
export const gazetteNoticesSource: WatchSource = {
	name: gazetteNoticesSourceName,
	summary: "reads The Gazette's corporate insolvency notices and tells the feed which register companies they name",
	run: sweepGazetteNotices
};
