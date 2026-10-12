/** One run of a named watcher: when it started, when it finished, and where it stopped. */
export type WatchRun = {
	id: string;
	source: string;
	startedAt: string;
	finishedAt: string | null;
	rowsWritten: number;
	resumeMarker: string;
	note: string;
};

export const watchRunColumns = 'id, source, started_at, finished_at, rows_written, resume_marker, note';

export function parseWatchRun(row: Record<string, unknown>): WatchRun {
	return {
		id: row.id as string,
		source: row.source as string,
		startedAt: row.started_at as string,
		finishedAt: (row.finished_at ?? null) as string | null,
		rowsWritten: Number(row.rows_written ?? 0),
		resumeMarker: (row.resume_marker ?? '') as string,
		note: (row.note ?? '') as string
	};
}
