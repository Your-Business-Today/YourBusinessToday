import type { SupabaseClient } from '@supabase/supabase-js';
import { postMessage } from '$lib/server/conversations/postMessage';
import { updateTaskStatus } from '$lib/server/projects/updateTaskStatus';
import { doneTaskStatus } from '$lib/data/taskStatus';
import type { Project } from '$lib/server/projects/projectRecord';
import { findPromotedTaskIds } from './findPromotedTaskIds';
import { liveMerges } from './liveMerges';
import { markTaskLive } from './markTaskLive';
import { liveMessage, promotionPublishedMessage } from './mergeDeployMessages';
import type { MergeDeploy } from './mergeDeploy';
import { readRecentMerges } from './readMergeDeploys';

const nobodySignedIn = null;

/**
 * Brings live every merge on the project whose checks have now passed: a promoted task is marked live, all the
 * tasks of one deploy at one moment, and a task merged straight into the default branch is marked done.
 */
export async function bringMergesLive(supabase: SupabaseClient, project: Project): Promise<string[]> {
	const { merges, checks } = await readRecentMerges(supabase, project.id);
	const nowLive = liveMerges(merges, checks);
	const promotedTaskIds = await findPromotedTaskIds(supabase, nowLive.map((merge) => merge.taskId));
	const liveAt = new Date().toISOString();
	for (const merge of nowLive) {
		await recordMergeLive(supabase, merge, liveAt);
		if (promotedTaskIds.has(merge.taskId)) await bringPromotedTaskLive(supabase, project, merge, liveAt);
		else await finishMergedTask(supabase, project, merge);
	}
	return nowLive.map((merge) => merge.taskId);
}

async function recordMergeLive(supabase: SupabaseClient, merge: MergeDeploy, liveAt: string): Promise<void> {
	const { error } = await supabase.from('task_merge_deploys').update({ live_at: liveAt }).eq('id', merge.id);
	if (error) throw error;
}

async function bringPromotedTaskLive(supabase: SupabaseClient, project: Project, merge: MergeDeploy, liveAt: string) {
	await markTaskLive(supabase, merge.taskId, project, liveAt, promotionPublishedMessage(project, merge.pullRequestUrl));
}

async function finishMergedTask(supabase: SupabaseClient, project: Project, merge: MergeDeploy): Promise<void> {
	await updateTaskStatus(supabase, merge.taskId, doneTaskStatus, nobodySignedIn);
	await postMessage(supabase, { taskId: merge.taskId }, project.ownerId, liveMessage(project));
}
