import { pullRequestUrlRefusal, taskBranchRefusal } from '$lib/data/branchName';
import { findTasksOnBranch } from '$lib/server/projects/findTasksOnBranch';
import { noSuchTask } from './describeTask';
import { objectSchema, readOptionalText, readText, textField } from '../actionTypes';
import { reachableProjectIds, reachableTaskWithProject } from '../projectAccess';
import { recordPullRequestMergedBefore } from '$lib/server/deploys/recordPullRequestMergedBefore';
import { setTaskBranch } from '$lib/server/projects/setTaskBranch';
import { startTask } from '$lib/server/projects/startTask';
import type { McpAction } from '../actionTypes';

const branchField = textField('The git branch, such as feature/weekly-cashflow-grid');

export const taskBranchActions: McpAction[] = [
	{
		name: 'set_task_branch',
		area: 'tasks',
		audience: 'everyone',
		isWrite: true,
		summary: 'record the git branch a task’s work is on, and its pull request once opened',
		guidance:
			'Call this as soon as you create the branch for a task, which moves a task in the backlog ' +
			'to In progress, and again with pullRequestUrl ' +
			'when you open the pull request — then enable auto-merge on the pull request, so GitHub ' +
			'merges it once its checks pass. When GitHub says that branch’s pull request merged, the ' +
			'task is marked done with a message on its conversation, and the repository’s own GitHub ' +
			'workflow runs any migration file the branch added. A pull request that had already merged ' +
			'when it is recorded is read from GitHub and recorded as the merge would have been: done and ' +
			'staged, and live where staging has since been promoted. An empty branch clears it.',
		inputSchema: objectSchema(
			{
				taskId: textField('The task id'),
				branch: branchField,
				pullRequestUrl: textField('The pull request’s https:// address — leave out if none yet')
			},
			['taskId', 'branch']
		),
		run: async (caller, input) => {
			const reached = await reachableTaskWithProject(caller, readText(input, 'taskId'));
			if (reached === null) return noSuchTask;
			const { task, project } = reached;
			const branchName = readText(input, 'branch');
			const pullRequestUrl = readOptionalText(input, 'pullRequestUrl') ?? undefined;
			const refusal =
				taskBranchRefusal(branchName, project.defaultBranch) ??
				pullRequestUrlRefusal(pullRequestUrl ?? '');
			if (refusal !== null) return refusal;
			await setTaskBranch(caller.supabase, task.id, { branchName, pullRequestUrl });
			if (branchName === '') return `"${task.title}" no longer has a branch.`;
			await startTask(caller.supabase, task.id, caller.accountId);
			const recorded = `"${task.title}" is worked on ${branchName}.`;
			if (pullRequestUrl === undefined) return recorded;
			const taskOnBranch = { ...task, branchName };
			const mergedBefore = await recordPullRequestMergedBefore(caller.supabase, taskOnBranch, project, pullRequestUrl);
			return `${recorded}${mergedBefore}`;
		}
	},
	{
		name: 'find_task_by_branch',
		area: 'tasks',
		audience: 'everyone',
		isWrite: false,
		summary: 'find the task whose work is on a git branch',
		guidance:
			'A session that starts on an existing branch calls this to find the task it is working ' +
			'on, then reads it with read_task.',
		inputSchema: objectSchema({ branch: branchField }, ['branch']),
		run: async (caller, input) => {
			const branchName = readText(input, 'branch');
			const tasks = await findTasksOnBranch(caller.supabase, branchName, reachableProjectIds(caller));
			if (tasks.length === 0) return `No task you can reach is worked on ${branchName}.`;
			return tasks.map((task) => `- ${task.title} (task id: ${task.id})`).join('\n');
		}
	}
];
