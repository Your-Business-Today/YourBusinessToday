import type { SupabaseClient } from '@supabase/supabase-js';
import { parseTaskRecord, type ProjectTask } from '$lib/server/projects/taskRecord';
import { rankChanges, redealtRanks, type RankChange } from '$lib/server/ordering/rankChanges';
import { rankColumnsOf, saveRanks } from '$lib/server/ordering/saveRanks';
import type { RankedScope } from '$lib/server/ordering/rankedScope';

/**
 * One sibling group: the tasks of a project that share a parent (or, at the
 * top level, have none), ranked by `priority`. Top level siblings also sit in
 * the owner's queue; saving a new sibling order deals their queue positions
 * out again in that order, so the two never contradict each other.
 */
export function taskSiblings(
	supabase: SupabaseClient,
	projectId: string,
	parentTaskId: string | null
): RankedScope<ProjectTask> {
	return {
		load: () => loadSiblings(supabase, projectId, parentTaskId),
		readRank: (task) => task.priority,
		save: (siblingsInOrder) => saveSiblingOrder(supabase, siblingsInOrder)
	};
}

export function siblingsOf(supabase: SupabaseClient, task: ProjectTask): RankedScope<ProjectTask> {
	return taskSiblings(supabase, task.projectId, task.parentTaskId);
}

async function loadSiblings(
	supabase: SupabaseClient,
	projectId: string,
	parentTaskId: string | null
): Promise<ProjectTask[]> {
	const siblings = supabase.from('tasks').select('*').eq('project_id', projectId);
	const scopedSiblings =
		parentTaskId === null
			? siblings.is('parent_task_id', null)
			: siblings.eq('parent_task_id', parentTaskId);
	const { data, error } = await scopedSiblings
		.order('priority', { ascending: true })
		.order('created_at', { ascending: true });
	if (error) throw error;
	return data.map(parseTaskRecord);
}

async function saveSiblingOrder(
	supabase: SupabaseClient,
	siblingsInOrder: ProjectTask[]
): Promise<void> {
	const priorityChanges = rankChanges(siblingsInOrder, (task) => task.priority);
	const queueChanges = redealtRanks(siblingsInOrder, (task) => task.globalPriority);
	await saveTaskRanks(supabase, priorityChanges, queueChanges);
}

/** A task's place among its siblings and its place in the queue, written together. */
export async function saveTaskRanks(
	supabase: SupabaseClient,
	priorityChanges: RankChange[],
	queueChanges: RankChange[]
): Promise<void> {
	const priorities = rankColumnsOf(priorityChanges);
	const queuePlaces = rankColumnsOf(queueChanges);
	await saveRanks(supabase, 'save_task_ranks', {
		priority_task_ids: priorities.ids,
		priorities: priorities.ranks,
		queue_task_ids: queuePlaces.ids,
		queue_ranks: queuePlaces.ranks
	});
}

export async function updateTaskColumns(
	supabase: SupabaseClient,
	taskId: string,
	columns: Record<string, number | string | null>
): Promise<void> {
	const { error } = await supabase.from('tasks').update(columns).eq('id', taskId);
	if (error) throw error;
}
