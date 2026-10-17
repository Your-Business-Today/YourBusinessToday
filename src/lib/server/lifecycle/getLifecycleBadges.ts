import type { SupabaseClient } from '@supabase/supabase-js';
import { badgeOf, type LifecycleBadge } from '$lib/data/lifecycleBadge';
import { getLifecycleMarks } from './getLifecycleMarks';

/** Each goal's and task's badge on the project, keyed by its id, ready to send to the page. */
export async function getLifecycleBadges(
	supabase: SupabaseClient,
	projectId: string
): Promise<Record<string, LifecycleBadge>> {
	const marks = await getLifecycleMarks(supabase, [projectId]);
	const badges: Record<string, LifecycleBadge> = {};
	for (const [subjectId, mark] of marks) badges[subjectId] = badgeOf(mark);
	return badges;
}
