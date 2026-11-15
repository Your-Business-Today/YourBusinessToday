import type { SupabaseClient } from '@supabase/supabase-js';
import { getDescendantsOfTask } from './getDescendantsOfTask';

export async function getTaskAndDescendantIds(
	supabase: SupabaseClient,
	taskId: string
): Promise<string[]> {
	const descendants = await getDescendantsOfTask(supabase, taskId);
	return [taskId, ...descendants.map((descendant) => descendant.id)];
}
