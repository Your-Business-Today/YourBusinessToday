import type { SupabaseClient } from '@supabase/supabase-js';
import { foodHygieneSourceName } from './foodHygieneSource';
import { heartbeatSourceName } from './heartbeatSource';
import { readLatestRun } from './watchRunLog';

/** When each watcher the patch page reports last started, or null when it never has. */
export type WatcherTimes = { heartbeatAt: string | null; foodHygieneAt: string | null };

export async function readWatcherTimes(supabase: SupabaseClient): Promise<WatcherTimes> {
	const [heartbeat, foodHygiene] = await Promise.all([
		readLatestRun(supabase, heartbeatSourceName),
		readLatestRun(supabase, foodHygieneSourceName)
	]);
	return { heartbeatAt: heartbeat?.startedAt ?? null, foodHygieneAt: foodHygiene?.startedAt ?? null };
}
