import type { SupabaseClient } from '@supabase/supabase-js';
import type { FinishedRun } from '$lib/data/mainRun';
import type { BranchRunTable } from './branchRunTables';

type PreviousRun = { runId: string; finishedAt: string };

/**
 * Keeps the run as its check's latest on the project's branch, and says whether it was new: a redelivered event,
 * or one older than the run already kept, changes nothing.
 */
export async function recordMainRun(
	supabase: SupabaseClient,
	table: BranchRunTable,
	projectId: string,
	run: FinishedRun
): Promise<boolean> {
	const previous = await readPreviousRun(supabase, table, projectId, run.checkName);
	if (previous !== null && !isLaterRun(run, previous)) return false;
	const { error } = await supabase.from(table).upsert(
		{
			project_id: projectId,
			check_name: run.checkName,
			run_id: run.runId,
			outcome: run.outcome,
			run_url: run.runUrl,
			finished_at: run.finishedAt,
			received_at: new Date().toISOString(),
			is_named_for_its_check: true
		},
		{ onConflict: 'project_id,check_name' }
	);
	if (error) throw error;
	return true;
}

function isLaterRun(run: FinishedRun, previous: PreviousRun): boolean {
	if (run.runId === previous.runId) return false;
	return new Date(run.finishedAt).getTime() >= new Date(previous.finishedAt).getTime();
}

async function readPreviousRun(
	supabase: SupabaseClient,
	table: BranchRunTable,
	projectId: string,
	checkName: string
): Promise<PreviousRun | null> {
	const { data, error } = await supabase
		.from(table)
		.select('run_id, finished_at')
		.eq('project_id', projectId)
		.eq('check_name', checkName)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return { runId: data.run_id, finishedAt: data.finished_at };
}
