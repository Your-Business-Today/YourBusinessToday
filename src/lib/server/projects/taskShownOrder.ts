import type { SupabaseClient } from '@supabase/supabase-js';
import { moveTask } from './moveTask';
import { setTaskPriority } from './setTaskPriority';
import { siblingsOf } from './taskSiblings';
import { placeBeside } from '$lib/server/ordering/rankedScope';
import { placementForMove, placementForPosition, type ShownPlacement } from '$lib/server/ordering/shownOrder';
import type { MoveDirection } from '$lib/server/ordering/rankedSet';
import type { ProjectTask } from './taskRecord';

/**
 * Reordering a list of tasks as the person sees it: with the shown tasks' ids,
 * a move or a position counts only those, so tasks the list leaves out (other
 * departments, the development side, the filtered) keep their places; without
 * them, every sibling is counted.
 */
export async function moveTaskAmongShown(
	supabase: SupabaseClient,
	task: ProjectTask,
	direction: MoveDirection,
	shownIds: string[] | null
): Promise<void> {
	if (shownIds === null) return moveTask(supabase, task.id, direction);
	await placeBesideShown(supabase, task, placementForMove(shownIds, task.id, direction));
}

export async function setTaskPosition(
	supabase: SupabaseClient,
	task: ProjectTask,
	position: number,
	shownIds: string[] | null
): Promise<void> {
	if (shownIds === null) return setTaskPriority(supabase, task.id, position);
	await placeBesideShown(supabase, task, placementForPosition(shownIds, task.id, position));
}

async function placeBesideShown(
	supabase: SupabaseClient,
	task: ProjectTask,
	shownPlacement: ShownPlacement | null
): Promise<void> {
	if (shownPlacement === null) return;
	await placeBeside(siblingsOf(supabase, task), task.id, shownPlacement.targetId, shownPlacement.placement);
}
