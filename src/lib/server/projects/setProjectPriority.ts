import type { SupabaseClient } from '@supabase/supabase-js';
import { projectList } from '$lib/server/projects/projectList';
import { setRank } from '$lib/server/ordering/rankedScope';

/** Put a project at a number in the viewer's projects list; the others shift to make room. */
export async function setProjectPriority(
	supabase: SupabaseClient,
	projectId: string,
	priority: number,
	viewerId: string
): Promise<void> {
	await setRank(projectList(supabase, viewerId), projectId, priority);
}
