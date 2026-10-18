import { branchNameRefusal, taskBranchRefusal } from '$lib/data/branchName';
import { getBuildModelSettings } from '$lib/server/buildModels/getBuildModelSettings';
import { lifecycleOutcomes, lifecycleSteps } from '$lib/data/lifecycleStep';
import { lifecycleStepFields } from './lifecycleFields';
import { noSuchTask } from './describeTask';
import { objectSchema, readText, textField } from '../actionTypes';
import { raiseReviewTask } from '$lib/server/buildModels/raiseReviewTask';
import { reachableTaskWithProject } from '../projectAccess';
import { recordLifecycleStep } from '$lib/server/lifecycle/recordLifecycleStep';
import { setTaskBranch } from '$lib/server/projects/setTaskBranch';
import { validateLifecycleStep } from '$lib/data/validateLifecycleStep';
import type { McpAction } from '../actionTypes';

const noReviewer = 'No review model is set. An administrator chooses one on the admin page.';

export const localBuildActions: McpAction[] = [
	{
		name: 'submit_local_build',
		area: 'tasks',
		audience: 'everyone',
		isWrite: true,
		summary:
			'hand a branch the local model built to review: records it built and raises a review task',
		guidance:
			'The local model never opens a pull request itself. When its branch is pushed, call this: ' +
			'the task is recorded built on the branch, and a review subtask on the same branch is ' +
			'raised for the review model, buildable and autocomplete, so next_buildable_task gives it ' +
			'to a Claude session that reviews, fixes, opens the pull request and turns on auto-merge.',
		inputSchema: objectSchema(
			{
				taskId: textField('The task the local model built'),
				branch: textField('The pushed branch the work is on'),
				agent: lifecycleStepFields.agent,
				model: lifecycleStepFields.model,
				runUrl: lifecycleStepFields.runUrl,
				note: lifecycleStepFields.note
			},
			['taskId', 'branch', 'agent']
		),
		run: async (caller, input) => {
			const reached = await reachableTaskWithProject(caller, readText(input, 'taskId'));
			if (reached === null) return noSuchTask;
			const { task, project } = reached;
			const branchName = readText(input, 'branch');
			const isBranchMissing = branchName === '';
			if (isBranchMissing) return 'Name the pushed branch the work is on.';
			const refusal = branchNameRefusal(branchName) ?? taskBranchRefusal(branchName, project.defaultBranch);
			if (refusal !== null) return refusal;
			const step = validateLifecycleStep({
				step: lifecycleSteps.built,
				outcome: lifecycleOutcomes.none,
				agent: readText(input, 'agent'),
				model: readText(input, 'model'),
				runUrl: readText(input, 'runUrl'),
				branchName,
				note: readText(input, 'note')
			});
			if (typeof step === 'string') return step;
			const { reviewModelId } = await getBuildModelSettings(caller.supabase);
			if (reviewModelId === '') return noReviewer;
			await recordLifecycleStep(caller.supabase, task.projectId, { taskId: task.id }, step);
			await setTaskBranch(caller.supabase, task.id, { branchName });
			const build = { task, branchName, reviewModelId };
			const reviewTaskId = await raiseReviewTask(caller.supabase, build, caller.accountId);
			return `"${task.title}" is built on ${branchName}. Review task raised for ${reviewModelId} (id: ${reviewTaskId}).`;
		}
	}
];
