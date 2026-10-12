import type { SupabaseClient } from '@supabase/supabase-js';
import { heartbeatSourceName } from './heartbeatSource';
import { readLatestRun } from './watchRunLog';

/** When the cron door last proved itself, or null when it never has. */
export async function readWatcherHeartbeat(supabase: SupabaseClient): Promise<string | null> {
	const run = await readLatestRun(supabase, heartbeatSourceName);
	return run?.finishedAt ?? null;
}
