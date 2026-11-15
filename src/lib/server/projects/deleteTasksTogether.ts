import type { SupabaseClient } from '@supabase/supabase-js';
import { compactTaskQueue, compactTaskSiblingRanks } from '$lib/server/ordering/compactInDatabase';
import { getAttachmentPathsForTasks, removeAttachmentFiles } from './attachmentFiles';
import { getOwnerIdOfProject } from './getOwnerIdOfProject';

export type TasksToDelete = { projectId: string; taskIds: string[]; deletedByAccountId: string };

const deleteTasksStep = 'delete_tasks';

/**
 * Deletes the tasks named, all on one project, in one step of the database (migration 0242). The database keeps a
 * record of each under whoever deleted them, and refuses the whole step when one of them is finished or would
 * leave a subtask behind. Their files go after them, so a refused delete leaves every file where it was, and the
 * ranks then close the gaps they leave.
 */
export async function deleteTasksTogether(supabase: SupabaseClient, tasksToDelete: TasksToDelete): Promise<void> {
	const { projectId, taskIds, deletedByAccountId } = tasksToDelete;
	if (taskIds.length === 0) return;
	const attachmentPaths = await getAttachmentPathsForTasks(supabase, taskIds);
	const step = { target_task_ids: taskIds, deleting_account_id: deletedByAccountId };
	const { error } = await supabase.rpc(deleteTasksStep, step);
	if (error) throw error;
	await removeAttachmentFiles(supabase, attachmentPaths);
	await compactTaskSiblingRanks(supabase, projectId);
	await compactTaskQueue(supabase, await getOwnerIdOfProject(supabase, projectId));
}
