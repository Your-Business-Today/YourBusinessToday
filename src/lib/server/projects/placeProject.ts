import type { SupabaseClient } from '@supabase/supabase-js';
import { boardOf, findProject } from '$lib/server/projects/projectBoard';
import { placeBeside } from '$lib/server/ordering/rankedScope';
import type { DropPlacement } from '$lib/server/ordering/rankedSet';

/** Drop a project beside another on the viewer's board; the target must be on that same board. */
export async function placeProject(
	supabase: SupabaseClient,
	movedProjectId: string,
	targetProjectId: string,
	placement: DropPlacement,
	viewerId: string
): Promise<void> {
	if (placement === 'inside') return;
	const movedProject = await findProject(supabase, movedProjectId);
	if (movedProject === null) return;
	await placeBeside(
		boardOf(supabase, movedProject, viewerId),
		movedProject.id,
		targetProjectId,
		placement
	);
}
