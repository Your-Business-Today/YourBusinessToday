import { reachableTask } from '../projectAccess';
import { noSuchTask } from './describeTask';
import { objectSchema, readOptionalText, readText, textField } from '../actionTypes';
import { setTaskWaitsFor } from '$lib/server/projects/setTaskWaitsFor';
import type { McpAction } from '../actionTypes';

export const taskSequenceActions: McpAction[] = [
	{
		name: 'set_task_waits_for',
		area: 'tasks',
		audience: 'everyone',
		isWrite: true,
		summary: 'put a task after the task it must wait for, so the two read as steps of a sequence',
		guidance:
			'A task waits for one task: the step before it. Chain a series of steps by giving each ' +
			'the one before, and every step shows the whole sequence, where it has got to and what it ' +
			'waits for; when a step is done, the next is told on its conversation. Assign each step to ' +
			'whoever does it with set_task_assignees. Leave waitsForTaskId out to let the task start ' +
			'whenever. A task cannot wait for itself, for a task on another project, or for a task ' +
			'that comes after it.',
		inputSchema: objectSchema(
			{
				taskId: textField('The task id'),
				waitsForTaskId: textField(
					'The task that must be done first — omit to let this task start whenever'
				)
			},
			['taskId']
		),
		run: async (caller, input) => {
			const task = await reachableTask(caller, readText(input, 'taskId'));
			if (task === null) return noSuchTask;
			const waitsForTaskId = readOptionalText(input, 'waitsForTaskId');
			const refusal = await setTaskWaitsFor(caller.supabase, task, waitsForTaskId);
			if (refusal !== null) return refusal;
			if (waitsForTaskId === null) return `"${task.title}" now starts whenever — it waits for no task.`;
			const waitedFor = await reachableTask(caller, waitsForTaskId);
			return `"${task.title}" now waits for "${waitedFor?.title}" to be done.`;
		}
	}
];
