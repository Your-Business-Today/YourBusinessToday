import { describeTask } from './describeTask';
import { findNextBuildableTask } from '$lib/server/buildModels/findNextBuildableTask';
import { getBuildModelSettings } from '$lib/server/buildModels/getBuildModelSettings';
import { lifecycleOutcomes, lifecycleSteps } from '$lib/data/lifecycleStep';
import { lifecycleStepFields } from './lifecycleFields';
import { loadTaskWorkspace } from '$lib/server/projects/loadTaskWorkspace';
import { objectSchema, readText, textField } from '../actionTypes';
import { reachableProjectIds } from '../projectAccess';
import { recordLifecycleStep } from '$lib/server/lifecycle/recordLifecycleStep';
import { validateLifecycleStep } from '$lib/data/validateLifecycleStep';
import type { McpAction } from '../actionTypes';

const nothingToBuild =
	'Nothing is waiting for that model: no open task you can reach is buildable, autocomplete, ' +
	'free of other AIs and sized for it.';

export const nextBuildableAction: McpAction = {
	name: 'next_buildable_task',
	area: 'tasks',
	audience: 'everyone',
	isWrite: true,
	summary:
		'take the next buildable, autocomplete task for your model, in queue order, and claim it for you',
	guidance:
		'Call it when you run on a schedule, instead of picking work yourself. It skips tasks another ' +
		'AI holds and tasks still waiting for an earlier step, claims the one it returns by ' +
		'recording building for you, and reads it in full. Record each step you take after that.',
	inputSchema: objectSchema(
		{
			modelId: textField('Your build model id, as read_model_settings lists it'),
			agent: lifecycleStepFields.agent,
			runUrl: lifecycleStepFields.runUrl
		},
		['modelId', 'agent']
	),
	run: async (caller, input) => {
		const modelId = readText(input, 'modelId');
		const step = validateLifecycleStep({
			step: lifecycleSteps.building,
			outcome: lifecycleOutcomes.none,
			agent: readText(input, 'agent'),
			model: modelId,
			runUrl: readText(input, 'runUrl'),
			branchName: '',
			note: ''
		});
		if (typeof step === 'string') return step;
		const { models } = await getBuildModelSettings(caller.supabase);
		const search = { projectIds: reachableProjectIds(caller), modelId, agent: step.agent, models };
		const task = await findNextBuildableTask(caller.supabase, search);
		if (task === null) return nothingToBuild;
		await recordLifecycleStep(caller.supabase, task.projectId, { taskId: task.id }, step);
		const workspace = await loadTaskWorkspace(caller.supabase, task.projectId, task.id);
		if (workspace === null) return nothingToBuild;
		return [`Claimed for ${step.agent}. Build this task:`, describeTask(workspace)].join('\n');
	}
};
