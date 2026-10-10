import { reachableTask } from '../projectAccess';
import { findTaskAttachment } from '$lib/server/projects/findTaskAttachment';
import { noSuchAttachment } from './describeAttachments';
import { noSuchTask } from './describeTask';
import { readText } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { ProjectTask } from '$lib/server/projects/taskRecord';
import type { TaskAttachment } from '$lib/server/projects/attachmentRecord';

export type NamedAttachment = { task: ProjectTask; attachment: TaskAttachment };

export async function findNamedAttachment(
	caller: McpCaller,
	input: Record<string, unknown>
): Promise<NamedAttachment | string> {
	const task = await reachableTask(caller, readText(input, 'taskId'));
	if (task === null) return noSuchTask;
	const attachment = await findTaskAttachment(caller.supabase, task.id, readText(input, 'attachmentId'));
	if (attachment === null) return noSuchAttachment;
	return { task, attachment };
}
