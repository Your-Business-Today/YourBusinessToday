import type { SupabaseClient } from '@supabase/supabase-js';
import { awaitMergeDeploy } from '$lib/server/mergeDeploys/awaitMergeDeploy';
import { awaitingDeployMessage, stagingMergeMessage } from '$lib/server/mergeDeploys/mergeDeployMessages';
import { bringMergesLive } from '$lib/server/mergeDeploys/bringMergesLive';
import { postMessage } from '$lib/server/conversations/postMessage';
import { recordTaskStaged } from '$lib/server/projects/recordTaskStaged';
import { updateTaskStatus } from '$lib/server/projects/updateTaskStatus';
import type { Project } from '$lib/server/projects/projectRecord';
import type { ProjectTask } from '$lib/server/projects/taskRecord';
import type { PullRequestEvent } from './readPullRequestEvent';
import { supportTaskKind } from '$lib/data/taskKind';
import { doneTaskStatus } from '$lib/data/taskStatus';
import { isStagingBranch } from '$lib/data/stagingBranch';

const nobodySignedIn = null;

/**
 * A merged pull request on a task's branch: into staging it marks the task done and staged at once, since the
 * promotion is the deploy that takes it live; into the default branch it marks the task done once the merge's
 * checks there pass, or at once where none report. A support task is told, and left for its answer.
 */
export async function recordMergedPullRequest(
	supabase: SupabaseClient,
	task: ProjectTask,
	project: Project,
	pullRequest: PullRequestEvent
): Promise<void> {
	const merged = `Merged: ${pullRequest.url} brought ${task.branchName} into ${mergedInto(pullRequest, project)}`;
	const isStaged = isStagingBranch(pullRequest.baseBranch, project.defaultBranch);
	if (isStaged) {
		await recordTaskStaged(supabase, task.id, new Date());
	}
	if (task.kind === supportTaskKind) {
		const sentence = `${merged}. Resolve this with the answer the person who raised it will read.`;
		await postMessage(supabase, { taskId: task.id }, project.ownerId, sentence);
		return;
	}
	if (isStaged) {
		await finishTask(supabase, task, project, stagingMergeMessage(merged, project));
		return;
	}
	const isAwaitingDeploy = await awaitMergeDeploy(supabase, task.id, project, pullRequest);
	if (isAwaitingDeploy) {
		await postMessage(supabase, { taskId: task.id }, project.ownerId, awaitingDeployMessage(merged, project));
		await bringMergesLive(supabase, project);
		return;
	}
	await finishTask(supabase, task, project, `${merged}, so this task is done.`);
}

async function finishTask(supabase: SupabaseClient, task: ProjectTask, project: Project, sentence: string) {
	await updateTaskStatus(supabase, task.id, doneTaskStatus, nobodySignedIn);
	await postMessage(supabase, { taskId: task.id }, project.ownerId, sentence);
}

/** The branch a merge landed on: the one GitHub named, or the default branch when it named none. */
function mergedInto(pullRequest: PullRequestEvent, project: Project): string {
	return pullRequest.baseBranch === '' ? project.defaultBranch : pullRequest.baseBranch;
}
