import type { SupabaseClient } from '@supabase/supabase-js';
import { boardOf } from './projectBoard';
import { getProject } from './getProject';

/**
 * The projects list shows a person's own projects and the ones they are on in
 * one run, but each sits on its own board: the shown rows on the moved
 * project's board, and how many shown rows come before them.
 */
export type ShownBoard = { shownIds: string[]; placesAbove: number };

export async function shownOnBoardOf(
	supabase: SupabaseClient,
	projectId: string,
	shownIds: string[],
	viewerId: string
): Promise<ShownBoard | null> {
	const project = await getProject(supabase, projectId);
	if (project === null) return null;
	const board = boardOf(supabase, project, viewerId);
	const boardPlaces = await board.load();
	const boardIds = new Set(boardPlaces.map((place) => place.id));
	const isOnBoard = (shownId: string) => boardIds.has(shownId);
	return {
		shownIds: shownIds.filter(isOnBoard),
		placesAbove: Math.max(0, shownIds.findIndex(isOnBoard))
	};
}
