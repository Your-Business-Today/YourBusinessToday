import { reachableTask } from '../projectAccess';
import { noSuchTask } from './describeTask';
import { objectSchema, readText, textField } from '../actionTypes';
import { setTaskPriorityMark } from '$lib/server/projects/setTaskPriorityMark';
import {
	priorityMarkRefusal,
	priorityMarkSentence,
	readPriorityMarkFromInput
} from '$lib/data/priorityMark';
import type { McpAction } from '../actionTypes';

export const priorityMarkActions: McpAction[] = [
	{
		name: 'mark_task_as_priority',
		area: 'tasks',
		audience: 'everyone',
		isWrite: true,
		summary: 'mark a task as priority, so it stands out on the boards and sits first, or take the mark off',
		guidance:
			'Marking a task puts it first among the tasks beside it (priority 1), as set_task_priority ' +
			'would, and the boards show it with a Priority badge. Taking the mark off leaves the task ' +
			'where it is. read_task, read_project and find_tasks say which tasks are marked.',
		inputSchema: objectSchema(
			{
				taskId: textField('The task id'),
				isPriority: { type: 'boolean', description: 'true to mark it as priority, false to take the mark off' }
			},
			['taskId', 'isPriority']
		),
		run: async (caller, input) => {
			const task = await reachableTask(caller, readText(input, 'taskId'));
			if (task === null) return noSuchTask;
			const isPriority = readPriorityMarkFromInput(input.isPriority);
			if (isPriority === undefined) return priorityMarkRefusal;
			await setTaskPriorityMark(caller.supabase, task.id, isPriority);
			return priorityMarkSentence(task.title, isPriority);
		}
	}
];
