import type { SupabaseClient } from '@supabase/supabase-js';
import type { WatchOutcome } from './watchRunLog';

/** Called after every unit of work a watcher commits, so a run cut off half way resumes from its marker. */
export type WatchProgress = (marker: string, rowsWritten: number) => Promise<void>;

/** A named watcher the cron door runs: it starts where the last run stopped and says where it got to. */
export type WatchSource = {
	name: string;
	summary: string;
	run: (supabase: SupabaseClient, resumeMarker: string, progress: WatchProgress) => Promise<WatchOutcome>;
};
