import type { SupabaseClient } from '@supabase/supabase-js';
import { compactTaskQueue, compactTaskSiblingRanks } from '$lib/server/ordering/compactInDatabase';
import { getAttachmentPathsForTasks, removeAttachmentFiles } from './attachmentFiles';
import { getOwnerIdOfProject } from '$lib/server/projects/getOwnerIdOfProject';
import { getTaskAndDescendantIds } from './getTaskAndDescendantIds';
import { getTask } from '$lib/server/projects/getTask';

export async function deleteTask(supabase: SupabaseClient, taskId: string): Promise<void> {
	const task = await getTask(supabase, taskId);
	const familyIds = await getTaskAndDescendantIds(supabase, taskId);
	await removeAttachmentFiles(supabase, await getAttachmentPathsForTasks(supabase, familyIds));
	const { error } = await supabase.from('tasks').delete().eq('id', taskId);
	if (error) throw error;
	if (task === null) return;
	await compactTaskSiblingRanks(supabase, task.projectId);
	if (task.parentTaskId === null) {
		await compactTaskQueue(supabase, await getOwnerIdOfProject(supabase, task.projectId));
	}
}
