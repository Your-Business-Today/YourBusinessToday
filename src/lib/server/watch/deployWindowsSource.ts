import type { SupabaseClient } from '@supabase/supabase-js';
import { runDeployWindows, type DeployWindowRun } from '$lib/server/deployWindows/runDeployWindows';
import type { WatchOutcome } from './watchRunLog';
import type { WatchSource } from './watchSource';

export const deployWindowsSourceName = 'deploy_windows';

/** Knocked every quarter hour: promotes staging to the default branch on each project whose deploy window has come. */
export const deployWindowsSource: WatchSource = {
	name: deployWindowsSourceName,
	summary: 'opens the staging-to-main pull request on each project whose deploy time has come today',
	run: runWindows
};

async function runWindows(supabase: SupabaseClient): Promise<WatchOutcome> {
	const runs = await runDeployWindows(supabase);
	return { rowsWritten: runs.length, resumeMarker: new Date().toISOString(), note: noteOf(runs), isFinished: true };
}

function noteOf(runs: DeployWindowRun[]): string {
	if (runs.length === 0) return 'No deploy window was due.';
	return runs.map((run) => `${run.projectName}: ${run.outcome} — ${run.note}`).join(' ');
}
