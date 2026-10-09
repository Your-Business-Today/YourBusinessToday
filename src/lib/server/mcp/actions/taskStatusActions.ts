import { reachableTask } from '../projectAccess';
import { noSuchTask } from './describeTask';
import { objectSchema, readText, textField } from '../actionTypes';
import { statusChangeRefusal } from '$lib/server/support/statusChangeRefusal';
import { taskStatusLabels, taskStatusOrder } from '$lib/data/taskStatus';
import { updateTaskStatus } from '$lib/server/projects/updateTaskStatus';
import type { McpAction } from '../actionTypes';
import type { TaskStatus } from '$lib/data/taskStatus';

export const taskStatusActions: McpAction[] = [
	{
		name: 'update_task_status',
		area: 'tasks',
		audience: 'everyone',
		isWrite: true,
		summary: 'move a task between backlog, in progress, on hold and done',
		guidance:
			'Marking a task done takes it to 100 per cent, whatever it was before, clears the ' +
			'notifications about it for everyone, and tells the person who asked for it. Every move ' +
			'shows on the project feed (read_project_feed). A support task closes through ' +
			'resolve_support_task instead, so its raiser gets an answer. In progress ' +
			'is when the work starts: work that changes a repository starts on a branch named for ' +
			'the task, never on the default branch, and set_task_branch records it. A task with a ' +
			'branch is marked done by itself when its pull request merges.',
		inputSchema: objectSchema(
			{ taskId: textField('The task id'), status: textField(taskStatusOrder.join(', ')) },
			['taskId', 'status']
		),
		run: async (caller, input) => {
			const task = await reachableTask(caller, readText(input, 'taskId'));
			if (task === null) return noSuchTask;
			const status = readStatus(input);
			if (status === null) return `A task is ${taskStatusOrder.join(', ')}. Pick one of those.`;
			const refusal = statusChangeRefusal(task, status);
			if (refusal !== null) return refusal;
			await updateTaskStatus(caller.supabase, task.id, status, caller.accountId);
			return `"${task.title}" is now ${taskStatusLabels[status]}.`;
		}
	}
];

function readStatus(input: Record<string, unknown>): TaskStatus | null {
	const status = readText(input, 'status');
	if (taskStatusOrder.includes(status as TaskStatus)) return status as TaskStatus;
	return null;
}
