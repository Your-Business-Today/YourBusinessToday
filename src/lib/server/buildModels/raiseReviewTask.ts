import type { SupabaseClient } from '@supabase/supabase-js';
import { createTask } from '$lib/server/projects/createTask';
import { setTaskAutocomplete } from '$lib/server/projects/setTaskAutocomplete';
import { setTaskBranch } from '$lib/server/projects/setTaskBranch';
import { setTaskBuildable } from '$lib/server/projects/setTaskBuildable';
import { taskKinds } from '$lib/data/taskKind';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

export type LocalBuild = { task: ProjectTask; branchName: string; reviewModelId: string };

const isReviewAutocomplete = true;

/**
 * The review of a local model's branch, raised as a subtask on the same branch, so the merge of
 * its pull request closes both. It is buildable and autocomplete, and needs the review model.
 */
export async function raiseReviewTask(
	supabase: SupabaseClient,
	build: LocalBuild,
	raisedBy: string
): Promise<string> {
	const { task, branchName } = build;
	const seed = {
		title: `Review "${task.title}" on ${branchName}`,
		details: reviewDetails(branchName),
		dueDate: null,
		parentTaskId: task.id,
		waitsForTaskId: null,
		goalId: task.goalId,
		kind: taskKinds.work
	};
	const reviewTaskId = await createTask(supabase, task.projectId, seed, raisedBy);
	await setTaskBranch(supabase, reviewTaskId, { branchName });
	await setTaskBuildable(supabase, reviewTaskId, { isBuildable: true, modelNeeded: build.reviewModelId });
	await setTaskAutocomplete(supabase, reviewTaskId, isReviewAutocomplete);
	return reviewTaskId;
}

function reviewDetails(branchName: string): string {
	return [
		`The local model built its parent task on ${branchName}.`,
		'Review the branch against the parent task and the repository’s CLAUDE.md, fix what must be ' +
			'fixed on the same branch, run the repository’s checks, open the pull request into the ' +
			'default branch with the parent task’s title, record it with set_task_branch on both tasks, ' +
			'and turn on auto-merge. The merge closes both tasks.'
	].join('\n\n');
}
