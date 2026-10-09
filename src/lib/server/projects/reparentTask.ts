import type { SupabaseClient } from '@supabase/supabase-js';
import { compactTaskQueue, compactTaskSiblingRanks } from '$lib/server/ordering/compactInDatabase';
import { getTask } from '$lib/server/projects/getTask';
import { nextQueueRank, nextSiblingRank } from '$lib/server/projects/nextRanks';
import { getOwnerIdOfProject } from '$lib/server/projects/getOwnerIdOfProject';
import { updateTaskColumns } from '$lib/server/projects/taskSiblings';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

/**
 * Moving a task under a new parent is leaving one sibling group and joining
 * the bottom of another. The group it left closes the gap; a task leaving the
 * top level also leaves the queue, and one arriving there joins its end.
 */
export async function reparentTask(
	supabase: SupabaseClient,
	taskId: string,
	newParentTaskId: string | null
): Promise<void> {
	const task = await getTask(supabase, taskId);
	if (task === null || task.parentTaskId === newParentTaskId) return;
	if (!(await canBecomeParentOf(supabase, task, newParentTaskId))) return;
	const priority = await nextSiblingRank(supabase, task.projectId, newParentTaskId);
	const globalPriority = await queueRankFor(supabase, task, newParentTaskId);
	await updateTaskColumns(supabase, taskId, {
		parent_task_id: newParentTaskId,
		priority,
		global_priority: globalPriority
	});
	await compactTaskSiblingRanks(supabase, task.projectId);
	if (task.parentTaskId === null) {
		await compactTaskQueue(supabase, await getOwnerIdOfProject(supabase, task.projectId));
	}
}

async function queueRankFor(
	supabase: SupabaseClient,
	task: ProjectTask,
	newParentTaskId: string | null
): Promise<number | null> {
	if (newParentTaskId !== null) return null;
	return nextQueueRank(supabase, task.projectId);
}

async function canBecomeParentOf(
	supabase: SupabaseClient,
	task: ProjectTask,
	newParentTaskId: string | null
): Promise<boolean> {
	if (newParentTaskId === null) return true;
	if (newParentTaskId === task.id) return false;
	const newParent = await getTask(supabase, newParentTaskId);
	if (newParent === null || newParent.projectId !== task.projectId) return false;
	return !(await isDescendantOf(supabase, newParent, task.id));
}

async function isDescendantOf(
	supabase: SupabaseClient,
	candidate: ProjectTask,
	ancestorTaskId: string
): Promise<boolean> {
	let currentParentId = candidate.parentTaskId;
	while (currentParentId !== null) {
		if (currentParentId === ancestorTaskId) return true;
		const parent = await getTask(supabase, currentParentId);
		if (parent === null) return false;
		currentParentId = parent.parentTaskId;
	}
	return false;
}
