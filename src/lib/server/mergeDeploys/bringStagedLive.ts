import type { SupabaseClient } from '@supabase/supabase-js';
import { findStagedTasks } from '$lib/server/projects/findStagedTasks';
import { markTaskLive } from './markTaskLive';
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
	const sentence = promotedLiveMessage(project, promotionUrl);
	for (const task of stagedTasks) {
		await markTaskLive(supabase, task.id, project, liveAt, sentence);
	}
	return stagedTasks.map((task) => task.id);
}
