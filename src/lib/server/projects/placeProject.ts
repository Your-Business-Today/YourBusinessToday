import type { SupabaseClient } from '@supabase/supabase-js';
import { projectList } from '$lib/server/projects/projectList';
import { placeBeside } from '$lib/server/ordering/rankedScope';
import { dropPlacements, type DropPlacement } from '$lib/server/ordering/rankedSet';

/** Drop a project beside another in the viewer's projects list, whoever owns either. */
export async function placeProject(
	supabase: SupabaseClient,
	movedProjectId: string,
	targetProjectId: string,
	placement: DropPlacement,
	viewerId: string
): Promise<void> {
	if (placement === dropPlacements.inside) return;
	await placeBeside(projectList(supabase, viewerId), movedProjectId, targetProjectId, placement);
}
