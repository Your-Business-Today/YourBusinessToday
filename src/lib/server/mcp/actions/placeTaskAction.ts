import { reachableTask } from '../projectAccess';
import { objectSchema, readText, textField } from '../actionTypes';
import { placeTask } from '$lib/server/projects/placeTask';
import { describeUnplacedTask, describeTaskPlacement } from './describeTaskPlacement';
import { placementStory } from './placementStory';
import {
	besidePlacementField,
	joinTargetGoalField,
	readBesidePlacement,
	readShouldJoinTargetGoal,
	sayWhetherToJoinGoal,
	sayWhichPlacement
} from './orderingFields';
import type { McpAction } from '../actionTypes';

const bothTasksNeeded = 'Name the task to move and the task to place it beside.';
const notBesideItself = 'A task cannot be placed beside itself.';
const goalJoinedAtTopLevel =
	'shouldJoinTargetGoal is for a top level target: a subtask counts toward its parent’s goal.';

export const placeTaskAction: McpAction = {
	name: 'place_task',
	area: 'tasks',
	audience: 'everyone',
	isWrite: true,
	summary: 'place a task directly before or after another task in the same project',
	guidance:
		'This sets the order and keeps the task’s goal: top level tasks are ordered together ' +
		'across every goal. Give shouldJoinTargetGoal true to move it into the target’s goal as ' +
		'well. A subtask is ordered among its parent’s subtasks, so a task placed beside a task ' +
		'under another parent joins that parent. The answer names every change made. To set a ' +
		'number without a target, use set_task_priority.',
	inputSchema: objectSchema(
		{
			taskId: textField('The task id'),
			targetTaskId: textField('The task to place it beside'),
			placement: besidePlacementField,
			shouldJoinTargetGoal: joinTargetGoalField
		},
		['taskId', 'targetTaskId', 'placement']
	),
	run: async (caller, input) => {
		const task = await reachableTask(caller, readText(input, 'taskId'));
		const targetTask = await reachableTask(caller, readText(input, 'targetTaskId'));
		if (task === null || targetTask === null) return bothTasksNeeded;
		if (task.projectId !== targetTask.projectId) return 'Both tasks must be on one project.';
		if (task.id === targetTask.id) return notBesideItself;
		const placement = readBesidePlacement(input);
		if (placement === null) return sayWhichPlacement;
		const shouldJoinTargetGoal = readShouldJoinTargetGoal(input);
		if (shouldJoinTargetGoal === null) return sayWhetherToJoinGoal;
		const isTargetASubtask = targetTask.parentTaskId !== null;
		if (shouldJoinTargetGoal && isTargetASubtask) return goalJoinedAtTopLevel;
		const placed = await placeTask(caller.supabase, task, targetTask, placement, shouldJoinTargetGoal);
		if (!placed.isPlaced) return describeUnplacedTask(task.title, targetTask.title);
		const story = await placementStory(caller.supabase, placed, targetTask, placement);
		return describeTaskPlacement(story);
	}
};
