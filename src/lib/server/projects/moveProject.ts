import type { SupabaseClient } from '@supabase/supabase-js';
import { boardOf } from '$lib/server/projects/projectBoard';
import { getProject } from '$lib/server/projects/getProject';
import { moveByOne } from '$lib/server/ordering/rankedScope';
import type { MoveDirection } from '$lib/server/ordering/rankedSet';

export type ProjectMoveDirection = MoveDirection;

/** Move a project one place on the viewer's board: their own when they own it, their team board otherwise. */
export async function moveProject(
	supabase: SupabaseClient,
	projectId: string,
	direction: ProjectMoveDirection,
	viewerId: string
): Promise<void> {
	const project = await getProject(supabase, projectId);
	if (project === null) return;
	await moveByOne(boardOf(supabase, project, viewerId), project.id, direction);
}
