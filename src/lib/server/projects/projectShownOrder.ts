import type { SupabaseClient } from '@supabase/supabase-js';
import { moveProject } from './moveProject';
import { placeProject } from './placeProject';
import { setProjectPriority } from './setProjectPriority';
import { shownOnBoardOf } from './shownOnBoard';
import { placementForMove, placementForPosition, type ShownPlacement } from '$lib/server/ordering/shownOrder';
import type { MoveDirection } from '$lib/server/ordering/rankedSet';

/**
 * Reordering a board as the person sees it: with the shown projects' ids, a
 * move or a position counts only those, so hidden projects keep their places;
 * without them, the whole board is counted. Shown rows on another board are
 * passed over, and a position counts from the first shown row of this one.
 */
export async function moveProjectAmongShown(
	supabase: SupabaseClient,
	projectId: string,
	direction: MoveDirection,
	shownIds: string[] | null,
	viewerId: string
): Promise<void> {
	if (shownIds === null) return moveProject(supabase, projectId, direction, viewerId);
	const shownBoard = await shownOnBoardOf(supabase, projectId, shownIds, viewerId);
	if (shownBoard === null) return;
	const placement = placementForMove(shownBoard.shownIds, projectId, direction);
	await placeBesideShown(supabase, projectId, placement, viewerId);
}

export async function setProjectPosition(
	supabase: SupabaseClient,
	projectId: string,
	position: number,
	shownIds: string[] | null,
	viewerId: string
): Promise<void> {
	if (shownIds === null) return setProjectPriority(supabase, projectId, position, viewerId);
	const shownBoard = await shownOnBoardOf(supabase, projectId, shownIds, viewerId);
	if (shownBoard === null) return;
	const positionOnBoard = position - shownBoard.placesAbove;
	const placement = placementForPosition(shownBoard.shownIds, projectId, positionOnBoard);
	await placeBesideShown(supabase, projectId, placement, viewerId);
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
