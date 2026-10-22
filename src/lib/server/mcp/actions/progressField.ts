import { getTask } from '$lib/server/projects/getTask';
import { statusChangeRefusal } from '$lib/server/support/statusChangeRefusal';
import { taskStatusLabels, taskStatuses, type TaskStatus } from '$lib/data/taskStatus';
import { textField } from '../actionTypes';
import { updateTaskStatus } from '$lib/server/projects/updateTaskStatus';
import type { McpCaller } from '../resolveMcpCaller';
import type { ResolvedSubject } from './resolveSubject';

const progressStatuses: Record<string, TaskStatus> = {
	started: taskStatuses.inProgress,
	finished: taskStatuses.done
};

const progressWords = Object.keys(progressStatuses);

export const progressField = textField(
	'When the message reports work someone has done on this task: started if some of it is done ' +
		'and more is to come, finished if the whole task is done. The task moves to In progress or ' +
		'Done with the message, so the board shows the work without anyone asking. On a task only.'
);

export const progressRefusal =
	`progress is ${progressWords.join(' or ')}, and only on a task. Nothing was posted.`;

/** The status the reported progress moves the task to; null when none is reported, undefined when it is not a word this takes. */
export function readProgress(input: Record<string, unknown>): TaskStatus | null | undefined {
	const progress = input.progress;
	if (progress === undefined) return null;
	return progressStatuses[String(progress).trim()];
}

/** Moves the task the work was reported on, never back: a task already done stays done. */
export async function applyProgress(
	caller: McpCaller,
	resolved: ResolvedSubject,
	status: TaskStatus
): Promise<string> {
	const { subject } = resolved;
	if (!('taskId' in subject)) return '';
	const task = await getTask(caller.supabase, subject.taskId);
	if (task === null) return '';
	const isMovingBack = task.status === taskStatuses.done;
	if (isMovingBack || task.status === status) return '';
	const refusal = statusChangeRefusal(task, status);
	if (refusal !== null) return ` ${refusal}`;
	await updateTaskStatus(caller.supabase, task.id, status, caller.accountId);
	return ` The task is now ${taskStatusLabels[status]}.`;
}
