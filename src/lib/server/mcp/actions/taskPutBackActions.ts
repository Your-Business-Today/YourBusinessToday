import { getTask } from '$lib/server/projects/getTask';
import { putBackDeletedTask } from '$lib/server/projects/putBackDeletedTask';
import { objectSchema, readText, textField } from '../actionTypes';
import { readableDeletion } from '../taskDeletionAccess';
import { describePutBack } from './describePutBack';
import { noSuchTaskDeletion } from './taskDeletionActions';
import type { McpAction } from '../actionTypes';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

const putBackOnlyWhenAsked =
	'Puts a deleted task back on its project, with the id it had, its conversation, lifecycle, feed, merges, ' +
	'criteria, checklists, assignees and roles, and points its to-dos, feature requests and the tasks that waited ' +
	'for it back at it. It goes back under the task it was under when that task still stands, and at the top level ' +
	'when it does not. Its attached files are not put back: they went from storage with the task. A task whose ' +
	'project has been deleted cannot be put back. Only when the person asks: read it first with read_task_deletion ' +
	'and say what will come back. The record stays, marked as put back.';

export const taskPutBackActions: McpAction[] = [
	{
		name: 'put_back_deleted_task',
		area: 'tasks',
		audience: 'everyone',
		isWrite: true,
		summary: 'put a deleted task back on its project from the record of deletions, with its conversation and history',
		guidance: putBackOnlyWhenAsked,
		inputSchema: objectSchema({ deletionId: textField('The deletion, as list_task_deletions gives it') }, [
			'deletionId'
		]),
		run: async (caller, input) => {
			const deletion = await readableDeletion(caller, readText(input, 'deletionId'));
			if (deletion === null) return noSuchTaskDeletion;
			const outcome = await putBackDeletedTask(caller.supabase, deletion.id, caller.accountId);
			if (outcome.refusal !== null) return outcome.refusal;
			return describePutBack(deletion, await parentOf(caller.supabase, outcome.taskId));
		}
	}
];

async function parentOf(supabase: SupabaseClient, taskId: string): Promise<ProjectTask | null> {
	const task = await getTask(supabase, taskId);
	const parentTaskId = task?.parentTaskId ?? null;
	if (parentTaskId === null) return null;
	return getTask(supabase, parentTaskId);
}
