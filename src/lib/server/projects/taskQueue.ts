import type { SupabaseClient } from '@supabase/supabase-js';
import { parseTaskRecord, type ProjectTask } from '$lib/server/projects/taskRecord';
import { rankChanges, redealtRanks } from '$lib/server/ordering/rankChanges';
import { saveTaskRanks } from '$lib/server/projects/taskSiblings';
import type { RankedScope } from '$lib/server/ordering/rankedScope';

/**
 * An owner's queue: the top level tasks across every project they own, ranked
 * by `global_priority` — the order the work is done in. A new queue order also
 * deals each project's top level `priority` values out again in queue order,
 * so a project's own backlog never contradicts the queue.
 */
export function taskQueue(supabase: SupabaseClient, ownerId: string): RankedScope<ProjectTask> {
	return {
		load: () => loadQueue(supabase, ownerId),
		readRank: (task) => task.globalPriority,
		save: (queueInOrder) => saveQueueOrder(supabase, queueInOrder)
	};
}

export function isQueued(task: ProjectTask): boolean {
	return task.parentTaskId === null && task.globalPriority !== null;
}

export async function findQueuedTask(
	supabase: SupabaseClient,
	taskId: string
): Promise<{ task: ProjectTask; ownerId: string } | null> {
	const { data, error } = await supabase
		.from('tasks')
		.select('*, projects!inner(owner_id)')
		.eq('id', taskId)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	const task = parseTaskRecord(data);
	if (!isQueued(task)) return null;
	return { task, ownerId: (data.projects as { owner_id: string }).owner_id };
}

async function loadQueue(supabase: SupabaseClient, ownerId: string): Promise<ProjectTask[]> {
	const { data, error } = await supabase
		.from('tasks')
		.select('*, projects!inner(owner_id, priority)')
		.eq('projects.owner_id', ownerId)
		.is('parent_task_id', null)
		.order('global_priority', { ascending: true, nullsFirst: false })
		.order('priority', { ascending: true })
		.order('created_at', { ascending: true });
	if (error) throw error;
	return data.map(parseTaskRecord);
}

async function saveQueueOrder(supabase: SupabaseClient, queueInOrder: ProjectTask[]): Promise<void> {
	const queueChanges = rankChanges(queueInOrder, (task) => task.globalPriority);
	const priorityChanges = projectIdsIn(queueInOrder).flatMap((projectId) =>
		redealtRanks(
			queueInOrder.filter((task) => task.projectId === projectId),
			(task) => task.priority
		)
	);
	await saveTaskRanks(supabase, priorityChanges, queueChanges);
}

function projectIdsIn(tasks: ProjectTask[]): string[] {
	return [...new Set(tasks.map((task) => task.projectId))];
}
