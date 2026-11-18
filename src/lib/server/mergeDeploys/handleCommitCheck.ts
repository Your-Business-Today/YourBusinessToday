import type { SupabaseClient } from '@supabase/supabase-js';
import { mainRunOutcomes, type FinishedRun } from '$lib/data/mainRun';
import type { Project } from '$lib/server/projects/projectRecord';
import { bringMergesLive } from './bringMergesLive';
import { checkStates } from './commitCheck';
import { findMergeDeploys } from './readMergeDeploys';
import { findPromotedTaskIds } from './findPromotedTaskIds';
import { recordCommitCheck } from './recordCommitCheck';
import { reopenFailedMerge } from './reopenFailedMerge';

/**
 * A finished check on a commit of the default branch. A failure on a task's merge reopens the tasks it merged, once however
 * often GitHub says so; a pass may bring merges live. Says whether the failure was a task's, so it raises no FIX. A
 * failure on a promotion's merge is the deploy's, not one task's: its tasks stay staged, not live, and it raises a FIX.
 */
export async function handleCommitCheck(supabase: SupabaseClient, project: Project, run: FinishedRun): Promise<boolean> {
	if (run.commitSha === '') return false;
	const check = { commitSha: run.commitSha, checkName: run.checkName, state: run.outcome, runUrl: run.runUrl };
	const recorded = await recordCommitCheck(supabase, project.id, check);
	if (!recorded.isRecorded) return false;
	const merges = await findOwnMerges(supabase, project.id, run.commitSha);
	const isMergeFailure = merges.length > 0 && run.outcome === mainRunOutcomes.failed;
	const isToldAlready = recorded.previousState === checkStates.failed;
	const mergesToReopen = isMergeFailure && !isToldAlready ? merges : [];
	for (const merge of mergesToReopen) await reopenFailedMerge(supabase, project, merge, run);
	await bringMergesLive(supabase, project);
	return isMergeFailure;
}

async function findOwnMerges(supabase: SupabaseClient, projectId: string, commitSha: string) {
	const merges = await findMergeDeploys(supabase, projectId, commitSha);
	const promotedTaskIds = await findPromotedTaskIds(supabase, merges.map((merge) => merge.taskId));
	return merges.filter((merge) => !promotedTaskIds.has(merge.taskId));
}
