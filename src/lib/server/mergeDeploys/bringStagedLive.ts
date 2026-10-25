import type { SupabaseClient } from '@supabase/supabase-js';
import { findStagedTasks } from '$lib/server/projects/findStagedTasks';
import { postMessage } from '$lib/server/conversations/postMessage';
import type { Project } from '$lib/server/projects/projectRecord';
import { promotedLiveMessage } from './mergeDeployMessages';

/** Marks live every task on the project whose work the promotion of staging has just carried. */
export async function bringStagedLive(
	supabase: SupabaseClient,
	project: Project,
	promotionUrl: string
): Promise<string[]> {
	const stagedTasks = await findStagedTasks(supabase, project.id);
	const liveAt = new Date().toISOString();
	for (const task of stagedTasks) {
		const { error } = await supabase.from('tasks').update({ live_at: liveAt }).eq('id', task.id);
		if (error) throw error;
		await postMessage(supabase, { taskId: task.id }, project.ownerId, promotedLiveMessage(project, promotionUrl));
	}
	return stagedTasks.map((task) => task.id);
}
