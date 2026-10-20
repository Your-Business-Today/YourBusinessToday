import type { SupabaseClient } from '@supabase/supabase-js';
import { mainRunOutcomes, type FinishedRun } from '$lib/data/mainRun';
import type { Project } from '$lib/server/projects/projectRecord';
import { bringMergesLive } from './bringMergesLive';
import { checkStates } from './commitCheck';
import { findMergeDeploys } from './readMergeDeploys';
import { recordCommitCheck } from './recordCommitCheck';
import { reopenFailedMerge } from './reopenFailedMerge';

/**
 * A finished check on a commit of the default branch. A failure on a task's merge reopens the tasks it merged, once however
 * often GitHub says so; a pass may bring merges live. Says whether the failure was a task's, so it raises no FIX.
 */
export async function handleCommitCheck(supabase: SupabaseClient, project: Project, run: FinishedRun): Promise<boolean> {
	if (run.commitSha === '') return false;
	const check = { commitSha: run.commitSha, checkName: run.checkName, state: run.outcome, runUrl: run.runUrl };
	const recorded = await recordCommitCheck(supabase, project.id, check);
	if (!recorded.isRecorded) return false;
	const merges = await findMergeDeploys(supabase, project.id, run.commitSha);
	const isMergeFailure = merges.length > 0 && run.outcome === mainRunOutcomes.failed;
	const isToldAlready = recorded.previousState === checkStates.failed;
	const mergesToReopen = isMergeFailure && !isToldAlready ? merges : [];
	for (const merge of mergesToReopen) await reopenFailedMerge(supabase, project, merge, run);
	await bringMergesLive(supabase, project);
	return isMergeFailure;
}
