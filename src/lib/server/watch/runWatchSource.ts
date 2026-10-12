import type { SupabaseClient } from '@supabase/supabase-js';
import { closeWatchRun, markWatchProgress, openWatchRun, readLatestRun } from './watchRunLog';
import type { WatchSource } from './watchSource';

export type WatchRunReport = { source: string; rowsWritten: number; resumeMarker: string; note: string; isFinished: boolean };

/** Opens a run, resumes the watcher from where its last run stopped, and closes the run with where it got to. */
export async function runWatchSource(supabase: SupabaseClient, source: WatchSource): Promise<WatchRunReport> {
	const lastRun = await readLatestRun(supabase, source.name);
	const resumeMarker = lastRun?.resumeMarker ?? '';
	const start = { resumeMarker, wasLastRunFinished: lastRun === null || lastRun.finishedAt !== null };
	const runId = await openWatchRun(supabase, source.name);
	const progress = (marker: string, rowsWritten: number) => markWatchProgress(supabase, runId, marker, rowsWritten);
	try {
		const outcome = await source.run(supabase, start, progress);
		await closeWatchRun(supabase, runId, outcome);
		return { source: source.name, ...outcome };
	} catch (failure) {
		const note = failure instanceof Error ? failure.message : String(failure);
		await closeWatchRun(supabase, runId, { rowsWritten: 0, resumeMarker, note, isFinished: false });
		throw failure;
	}
}
