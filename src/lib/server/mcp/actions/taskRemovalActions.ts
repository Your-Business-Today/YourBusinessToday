import { reachableTask } from '../projectAccess';
import { deleteTask } from '$lib/server/projects/deleteTask';
import { describeTaskDeletion } from './describeTaskDeletion';
import { noSuchTask } from './describeTask';
import { objectSchema, readOptionalText, readText, textField } from '../actionTypes';
import { taskDeletionInputs } from '$lib/data/taskDeletion';
import type { McpAction } from '../actionTypes';

const { keepFinishedUnderTitle, deleteOpenSubtasks } = taskDeletionInputs;

const completedTaskTitleField = textField(
	'When it has finished subtasks: what to call the new completed task they are kept under'
);

const openSubtasksField = {
	type: 'boolean',
	description: 'True to delete the open subtasks with it, once the person has seen which they are'
};

export const trueOrFalseRefusal = `${deleteOpenSubtasks} is true or false, or left out. Nothing was deleted.`;

export const taskRemovalActions: McpAction[] = [
	{
		name: 'delete_task',
		area: 'tasks',
		audience: 'everyone',
		isWrite: true,
		summary:
			'delete a task that is not finished: its finished subtasks are kept under a new completed task, ' +
			'and its open subtasks go only when you say so',
		guidance:
			'Finished work is never deleted: a task marked done is the record of the work, and this refuses ' +
			'it. Deleting is for a task raised by mistake or no longer wanted, and only on the person’s ' +
			'word. Call it first with the task id alone: when the task has subtasks nothing is deleted, and ' +
			'the answer lists which are finished and which are open. The finished ones are always kept, ' +
			'moved under a new completed task in its place, which you name with keepFinishedUnderTitle for ' +
			'the work they finished. The open ones are deleted only with deleteOpenSubtasks true, after the ' +
			'person has seen the list; to keep one, move it out first with set_task_parent. A copy of every ' +
			'deleted task is kept with its conversation and history, though not its attached files, and ' +
			'list_task_deletions shows it, but nothing here puts one back, so read the task first with read_task, which shows its subtasks.',
		inputSchema: objectSchema(
			{
				taskId: textField('The task id'),
				[keepFinishedUnderTitle]: completedTaskTitleField,
				[deleteOpenSubtasks]: openSubtasksField
			},
			['taskId']
		),
		run: async (caller, input) => {
			const task = await reachableTask(caller, readText(input, 'taskId'));
			if (task === null) return noSuchTask;
			const wordOnOpenSubtasks = input[deleteOpenSubtasks];
			const isAnswered = wordOnOpenSubtasks === undefined || typeof wordOnOpenSubtasks === 'boolean';
			if (!isAnswered) return trueOrFalseRefusal;
			const outcome = await deleteTask(caller.supabase, task, {
				completedParentTitle: readOptionalText(input, keepFinishedUnderTitle),
				shouldDeleteOpenSubtasks: wordOnOpenSubtasks === true,
				deletedByAccountId: caller.accountId
			});
			return describeTaskDeletion(outcome);
		}
	}
];
