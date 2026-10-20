import type { SupabaseClient } from '@supabase/supabase-js';
import { findProjectsByRepository } from '$lib/server/deploys/findProjectsByRepository';
import { mainRunOutcomes, type FinishedRun } from '$lib/data/mainRun';
import { handleCommitCheck } from '$lib/server/mergeDeploys/handleCommitCheck';
import { isOnDefaultBranch } from './isOnDefaultBranch';
import { raiseFailedRunTask } from './raiseFailedRunTask';
import { recordMainRun } from './recordMainRun';
import type { Project } from '$lib/server/projects/projectRecord';

export type FinishedRunOutcome =
	| { kind: 'ignored'; reason: 'not_a_finished_run' | 'not_the_default_branch' }
	| { kind: 'recorded'; projects: RecordedRun[] };

type RecordedRun = { projectId: string; isNew: boolean; fixTaskId: string | null };

/**
 * A finished run on a project's default branch becomes its latest for that check. A failure on a task's merge is
 * told on that task; any other new failure raises a FIX.
 */
export async function handleFinishedRun(
	supabase: SupabaseClient,
	run: FinishedRun | null
): Promise<FinishedRunOutcome> {
	if (run === null) return { kind: 'ignored', reason: 'not_a_finished_run' };
	const projects = await findProjectsByRepository(supabase, run.repositoryUrl);
	const onMain = projects.filter((project) => isOnDefaultBranch(run, project));
	if (onMain.length === 0) return { kind: 'ignored', reason: 'not_the_default_branch' };
	const recorded = [];
	for (const project of onMain) recorded.push(await recordAndRaise(supabase, project, run));
	return { kind: 'recorded', projects: recorded };
}

async function recordAndRaise(supabase: SupabaseClient, project: Project, run: FinishedRun): Promise<RecordedRun> {
	const isNew = await recordMainRun(supabase, project.id, run);
	const isMergeFailure = await handleCommitCheck(supabase, project, run);
	const isNewFailure = isNew && run.outcome === mainRunOutcomes.failed && !isMergeFailure;
	const fixTaskId = isNewFailure ? await raiseFailedRunTask(supabase, project, run) : null;
	return { projectId: project.id, isNew, fixTaskId };
}
