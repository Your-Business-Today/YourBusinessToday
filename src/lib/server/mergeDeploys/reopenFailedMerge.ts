import type { SupabaseClient } from '@supabase/supabase-js';
import { postMessage } from '$lib/server/conversations/postMessage';
import { updateTaskStatus } from '$lib/server/projects/updateTaskStatus';
import { inProgressTaskStatus } from '$lib/data/taskStatus';
import type { FinishedRun } from '$lib/data/mainRun';
import type { Project } from '$lib/server/projects/projectRecord';
import { failedDeployMessage } from './mergeDeployMessages';
import type { MergeDeploy } from './mergeDeploy';

const nobodySignedIn = null;

/** A check failed on a task's merge: the task is open again, with the run's link on its conversation. */
export async function reopenFailedMerge(
	supabase: SupabaseClient,
	project: Project,
	merge: MergeDeploy,
	run: FinishedRun
): Promise<void> {
	const { error } = await supabase.from('task_merge_deploys').update({ live_at: null }).eq('id', merge.id);
	if (error) throw error;
	await updateTaskStatus(supabase, merge.taskId, inProgressTaskStatus, nobodySignedIn);
	await postMessage(supabase, { taskId: merge.taskId }, project.ownerId, failedDeployMessage(project, merge, run));
}
