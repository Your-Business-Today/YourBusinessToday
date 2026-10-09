import type { SupabaseClient } from '@supabase/supabase-js';
import { getOwnerIdOfProject } from '$lib/server/projects/getOwnerIdOfProject';
import type { GoalHorizon } from '$lib/data/goalHorizon';

/**
 * A new row joins the bottom of its ranked set. Ranks are dense, so the next
 * one is the highest in the scope plus one.
 */

const lastFirst = { ascending: false };

export async function nextRankOnBoard(supabase: SupabaseClient, ownerId: string): Promise<number> {
	const highest = await supabase
		.from('projects')
		.select('priority')
		.eq('owner_id', ownerId)
		.order('priority', lastFirst)
		.limit(1)
		.maybeSingle();
	return oneAfter(highest, 'priority');
}

export async function nextGoalRank(
	supabase: SupabaseClient,
	projectId: string,
	horizon: GoalHorizon
): Promise<number> {
	const highest = await supabase
		.from('goals')
		.select('priority')
		.eq('project_id', projectId)
		.eq('horizon', horizon)
		.order('priority', lastFirst)
		.limit(1)
		.maybeSingle();
	return oneAfter(highest, 'priority');
}

export async function nextSiblingRank(
	supabase: SupabaseClient,
	projectId: string,
	parentTaskId: string | null
): Promise<number> {
	const siblings = supabase.from('tasks').select('priority').eq('project_id', projectId);
	const scopedSiblings =
		parentTaskId === null
			? siblings.is('parent_task_id', null)
			: siblings.eq('parent_task_id', parentTaskId);
	const highest = await scopedSiblings.order('priority', lastFirst).limit(1).maybeSingle();
	return oneAfter(highest, 'priority');
}

export async function nextQueueRank(supabase: SupabaseClient, projectId: string): Promise<number> {
	const ownerId = await getOwnerIdOfProject(supabase, projectId);
	const highest = await supabase
		.from('tasks')
		.select('global_priority, projects!inner(owner_id)')
		.eq('projects.owner_id', ownerId)
		.not('global_priority', 'is', null)
		.order('global_priority', lastFirst)
		.limit(1)
		.maybeSingle();
	return oneAfter(highest, 'global_priority');
}

type HighestRow = { data: Record<string, unknown> | null; error: unknown };

function oneAfter(highest: HighestRow, column: string): number {
	if (highest.error) throw highest.error;
	const rank = highest.data?.[column];
	if (typeof rank !== 'number') return 1;
	return rank + 1;
}
