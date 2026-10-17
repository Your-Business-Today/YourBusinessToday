import { buildableSentence } from '$lib/data/taskModel';
import { buildQueueAction } from './buildQueueAction';
import { getBuildModelSettings } from '$lib/server/buildModels/getBuildModelSettings';
import { nextBuildableAction } from './nextBuildableAction';
import { recentLifecycleAction } from './recentLifecycleAction';
import { noSuchTask } from './describeTask';
import { objectSchema, readText, textField } from '../actionTypes';
import { reachableTask } from '../projectAccess';
import { setTaskBuildable } from '$lib/server/projects/setTaskBuildable';
import { validateTaskBuildable } from '$lib/data/validateTaskBuildable';
import type { McpAction } from '../actionTypes';

export const buildableActions: McpAction[] = [
	{
		name: 'set_task_buildable',
		area: 'tasks',
		audience: 'everyone',
		isWrite: true,
		summary:
			'tag a task buildable or not, and name the model it needs or let its story points choose',
		guidance:
			'A task is buildable when it needs nothing from a person and no infrastructure change, so ' +
			'a model may build it unattended. Recording it considered as buildable tags it for you. ' +
			'Leave the model out to let its story points choose through read_model_settings.',
		inputSchema: objectSchema(
			{
				taskId: textField('The task id'),
				isBuildable: { type: 'boolean', description: 'true when a model may build it unattended' },
				modelId: textField('A build model id to name — leave out to follow its story points')
			},
			['taskId', 'isBuildable']
		),
		run: async (caller, input) => {
			const task = await reachableTask(caller, readText(input, 'taskId'));
			if (task === null) return noSuchTask;
			const { models } = await getBuildModelSettings(caller.supabase);
			const fields = { isBuildable: input.isBuildable, modelId: input.modelId };
			const buildable = validateTaskBuildable(fields, models);
			if (typeof buildable === 'string') return buildable;
			await setTaskBuildable(caller.supabase, task.id, buildable);
			const tagged = { storyPoints: task.storyPoints, modelNeeded: buildable.modelNeeded };
			return `"${task.title}": ${buildableSentence(buildable.isBuildable, tagged, models)}`;
		}
	},
	nextBuildableAction,
	buildQueueAction,
	recentLifecycleAction
];
