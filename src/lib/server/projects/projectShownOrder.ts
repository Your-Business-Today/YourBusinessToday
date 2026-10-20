import type { SupabaseClient } from '@supabase/supabase-js';
import { moveProject } from './moveProject';
import { placeProject } from './placeProject';
import { setProjectPriority } from './setProjectPriority';
import { placementForMove, placementForPosition, type ShownPlacement } from '$lib/server/ordering/shownOrder';
import type { MoveDirection } from '$lib/server/ordering/rankedSet';

/**
 * Reordering a board as the person sees it: with the shown projects' ids, a
 * move or a position counts only those, so hidden projects keep their places;
 * without them, the whole board is counted.
 */
export async function moveProjectAmongShown(
	supabase: SupabaseClient,
	projectId: string,
	direction: MoveDirection,
	shownIds: string[] | null,
	viewerId: string
): Promise<void> {
	if (shownIds === null) return moveProject(supabase, projectId, direction, viewerId);
	await placeBesideShown(supabase, projectId, placementForMove(shownIds, projectId, direction), viewerId);
}

export async function setProjectPosition(
	supabase: SupabaseClient,
	projectId: string,
	position: number,
	shownIds: string[] | null,
	viewerId: string
): Promise<void> {
	if (shownIds === null) return setProjectPriority(supabase, projectId, position, viewerId);
	await placeBesideShown(supabase, projectId, placementForPosition(shownIds, projectId, position), viewerId);
}

async function placeBesideShown(
	supabase: SupabaseClient,
	projectId: string,
	shownPlacement: ShownPlacement | null,
	viewerId: string
): Promise<void> {
	if (shownPlacement === null) return;
	await placeProject(supabase, projectId, shownPlacement.targetId, shownPlacement.placement, viewerId);
}
