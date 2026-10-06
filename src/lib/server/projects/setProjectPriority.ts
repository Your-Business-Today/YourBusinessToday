import type { SupabaseClient } from '@supabase/supabase-js';
import { boardOf } from '$lib/server/projects/projectBoard';
import { getProject } from '$lib/server/projects/getProject';
import { setRank } from '$lib/server/ordering/rankedScope';

/** Put a project at a rank on the viewer's board; the others shift to make room. */
export async function setProjectPriority(
	supabase: SupabaseClient,
	projectId: string,
	priority: number,
	viewerId: string
): Promise<void> {
	const project = await getProject(supabase, projectId);
	if (project === null) return;
	await setRank(boardOf(supabase, project, viewerId), project.id, priority);
}
