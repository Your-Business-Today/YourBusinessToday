import type { SupabaseClient } from '@supabase/supabase-js';
import { projectList } from '$lib/server/projects/projectList';
import { moveByOne } from '$lib/server/ordering/rankedScope';
import type { MoveDirection } from '$lib/server/ordering/rankedSet';

export type ProjectMoveDirection = MoveDirection;

/** Move a project one place up or down the viewer's projects list, whoever owns it. */
export async function moveProject(
	supabase: SupabaseClient,
	projectId: string,
	direction: ProjectMoveDirection,
	viewerId: string
): Promise<void> {
	await moveByOne(projectList(supabase, viewerId), projectId, direction);
}
