import type { SupabaseClient } from '@supabase/supabase-js';
import { markTaskLive } from './markTaskLive';
import type { Project } from '$lib/server/projects/projectRecord';
import type { ProjectTask } from '$lib/server/projects/taskRecord';
import { promotedLiveMessage } from './mergeDeployMessages';

/** Marks live at once every staged task the promotion of staging carried, for a project whose deploy reports no checks. */
export async function bringStagedLive(
	supabase: SupabaseClient,
	project: Project,
	promotionUrl: string,
	stagedTasks: ProjectTask[]
): Promise<string[]> {
	const liveAt = new Date().toISOString();
	const sentence = promotedLiveMessage(project, promotionUrl);
	for (const task of stagedTasks) {
		await markTaskLive(supabase, task.id, project, liveAt, sentence);
	}
	return stagedTasks.map((task) => task.id);
}
