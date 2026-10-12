import type { WatchSource } from './watchSource';

export const heartbeatSourceName = 'heartbeat';

/** Writes one run and nothing else, so the cron door is seen to work before any watcher depends on it. */
export const heartbeatSource: WatchSource = {
	name: heartbeatSourceName,
	summary: 'proves the cron door runs by logging a run',
	run: async () => ({ rowsWritten: 0, resumeMarker: new Date().toISOString(), note: 'The cron door is open.', isFinished: true })
};
