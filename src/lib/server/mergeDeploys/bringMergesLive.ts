import type { SupabaseClient } from '@supabase/supabase-js';
import { postMessage } from '$lib/server/conversations/postMessage';
import { updateTaskStatus } from '$lib/server/projects/updateTaskStatus';
import { doneTaskStatus } from '$lib/data/taskStatus';
import type { Project } from '$lib/server/projects/projectRecord';
import { liveMerges } from './liveMerges';
import { liveMessage } from './mergeDeployMessages';
import { readRecentMerges } from './readMergeDeploys';

const nobodySignedIn = null;

/** Marks done every task on the project whose merge has now gone live. */
export async function bringMergesLive(supabase: SupabaseClient, project: Project): Promise<string[]> {
	const { merges, checks } = await readRecentMerges(supabase, project.id);
	const nowLive = liveMerges(merges, checks);
	for (const merge of nowLive) {
		const { error } = await supabase
			.from('task_merge_deploys')
			.update({ live_at: new Date().toISOString() })
			.eq('id', merge.id);
		if (error) throw error;
		await updateTaskStatus(supabase, merge.taskId, doneTaskStatus, nobodySignedIn);
		await postMessage(supabase, { taskId: merge.taskId }, project.ownerId, liveMessage(project));
	}
	return nowLive.map((merge) => merge.taskId);
}
