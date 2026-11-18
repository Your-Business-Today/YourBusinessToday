import type { SupabaseClient } from '@supabase/supabase-js';
import { postMessage } from '$lib/server/conversations/postMessage';
import { findStagedTasks } from '$lib/server/projects/findStagedTasks';
import type { PullRequestEvent } from '$lib/server/deploys/readPullRequestEvent';
import type { Project } from '$lib/server/projects/projectRecord';
import type { ProjectTask } from '$lib/server/projects/taskRecord';
import { awaitMergeDeploy } from './awaitMergeDeploy';
import { bringMergesLive } from './bringMergesLive';
import { bringStagedLive } from './bringStagedLive';
import { promotedDeployingMessage } from './mergeDeployMessages';

/**
 * The promotion of staging carries every staged task to the default branch. They go live once every check GitHub
 * runs on the promotion's merge there has passed, since the site publishes only when its deploy finishes. A project
 * with no checks reporting on its default branch, or a merge GitHub gave no commit for, goes live at the merge.
 */
export async function carryStagedTasks(supabase: SupabaseClient, project: Project, promotion: PullRequestEvent): Promise<string[]> {
	const stagedTasks = await findStagedTasks(supabase, project.id);
	if (stagedTasks.length === 0) return [];
	const isAwaitingChecks = await awaitEveryMerge(supabase, project, promotion, stagedTasks);
	if (!isAwaitingChecks) return bringStagedLive(supabase, project, promotion.url, stagedTasks);
	const sentence = promotedDeployingMessage(project, promotion.url);
	for (const task of stagedTasks) await postMessage(supabase, { taskId: task.id }, project.ownerId, sentence);
	await bringMergesLive(supabase, project);
	return stagedTasks.map((task) => task.id);
}

async function awaitEveryMerge(
	supabase: SupabaseClient,
	project: Project,
	promotion: PullRequestEvent,
	tasks: ProjectTask[]
): Promise<boolean> {
	for (const task of tasks) {
		const isAwaiting = await awaitMergeDeploy(supabase, task.id, project, promotion);
		if (!isAwaiting) return false;
	}
	return true;
}
