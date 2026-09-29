import type { SupabaseClient } from '@supabase/supabase-js';
import { boardOf, findProject } from '$lib/server/projects/projectBoard';
import { setRank } from '$lib/server/ordering/rankedScope';

/** Put a project at a rank on the viewer's board; the others shift to make room. */
export async function setProjectPriority(
	supabase: SupabaseClient,
	projectId: string,
	priority: number,
	viewerId: string
): Promise<void> {
	const project = await findProject(supabase, projectId);
	if (project === null) return;
	await setRank(boardOf(supabase, project, viewerId), project.id, priority);
}
