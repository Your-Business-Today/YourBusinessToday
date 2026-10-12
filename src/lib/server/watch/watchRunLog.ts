import type { SupabaseClient } from '@supabase/supabase-js';
import { parseWatchRun, watchRunColumns, type WatchRun } from './watchRunRecord';

/** What a watcher hands back when it stops: how much it wrote, where to pick up, and a word on how it went. */
export type WatchOutcome = { rowsWritten: number; resumeMarker: string; note: string; isFinished: boolean };

/** The most recent run of a source, finished or not. */
export async function readLatestRun(supabase: SupabaseClient, source: string): Promise<WatchRun | null> {
	const { data, error } = await supabase
		.from('watch_runs')
		.select(watchRunColumns)
		.eq('source', source)
		.order('started_at', { ascending: false })
		.limit(1)
		.maybeSingle();
	if (error) throw error;
	return data === null ? null : parseWatchRun(data);
}

/** Committed after each unit of work, so a run the platform cuts off still says where it stopped. */
export async function markWatchProgress(supabase: SupabaseClient, runId: string, marker: string, rowsWritten: number): Promise<void> {
	const { error } = await supabase.from('watch_runs').update({ resume_marker: marker, rows_written: rowsWritten }).eq('id', runId);
	if (error) throw error;
}

export async function openWatchRun(supabase: SupabaseClient, source: string): Promise<string> {
	const { data, error } = await supabase.from('watch_runs').insert({ source }).select('id').single();
	if (error) throw error;
	return data.id as string;
}

/** A run that finished is stamped; one that stopped half way keeps its marker and says so, with no finished_at. */
export async function closeWatchRun(supabase: SupabaseClient, runId: string, outcome: WatchOutcome): Promise<void> {
	const { error } = await supabase
		.from('watch_runs')
		.update({
			finished_at: outcome.isFinished ? new Date().toISOString() : null,
			rows_written: outcome.rowsWritten,
			resume_marker: outcome.resumeMarker,
			note: outcome.note
		})
		.eq('id', runId);
	if (error) throw error;
}
