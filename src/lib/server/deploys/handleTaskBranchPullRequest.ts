import type { SupabaseClient } from '@supabase/supabase-js';
import { findProjectsByRepository } from './findProjectsByRepository';
import { findTasksOnBranch } from '$lib/server/projects/findTasksOnBranch';
import { postMessage } from '$lib/server/conversations/postMessage';
import { setTaskBranch } from '$lib/server/projects/setTaskBranch';
import { updateTaskStatus } from '$lib/server/projects/updateTaskStatus';
import type { Project } from '$lib/server/projects/projectRecord';
import type { ProjectTask } from '$lib/server/projects/taskRecord';
import type { PullRequestEvent } from './readPullRequestEvent';

export type BranchOutcome = { kind: 'no_task_on_branch' } | { kind: 'recorded'; taskIds: string[] };

/** A pull request from a task's branch is recorded on the task; its merge marks the task done. */
export async function handleTaskBranchPullRequest(
	supabase: SupabaseClient,
	pullRequest: PullRequestEvent
): Promise<BranchOutcome> {
	const projects = await findProjectsByRepository(supabase, pullRequest.repositoryUrl);
	const projectIds = projects.map((project) => project.id);
	const tasks = await findTasksOnBranch(supabase, pullRequest.branchName, projectIds);
	if (tasks.length === 0) return { kind: 'no_task_on_branch' };
	for (const task of tasks) await recordOnTask(supabase, task, projects, pullRequest);
	return { kind: 'recorded', taskIds: tasks.map((task) => task.id) };
}

async function recordOnTask(
	supabase: SupabaseClient,
	task: ProjectTask,
	projects: Project[],
	pullRequest: PullRequestEvent
): Promise<void> {
	const branch = { branchName: task.branchName, pullRequestUrl: pullRequest.url };
	await setTaskBranch(supabase, task.id, branch);
	if (pullRequest.change !== 'merged') return;
	const project = projects.find((candidate) => candidate.id === task.projectId);
	if (project === undefined) return;
	const merged = `Merged: ${pullRequest.url} brought ${task.branchName} into ${project.defaultBranch}`;
	if (task.kind === 'support') {
		const sentence = `${merged}. Resolve this with the answer the person who raised it will read.`;
		await postMessage(supabase, { taskId: task.id }, project.ownerId, sentence);
		return;
	}
	await updateTaskStatus(supabase, task.id, 'done');
	await postMessage(supabase, { taskId: task.id }, project.ownerId, `${merged}, so this task is done.`);
}
