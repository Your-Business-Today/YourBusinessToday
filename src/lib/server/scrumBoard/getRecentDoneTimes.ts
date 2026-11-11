import type { SupabaseClient } from '@supabase/supabase-js';
import { feedEventKinds } from '$lib/data/feedEventKind';

/** When each of the project's tasks was last marked done, for the tasks marked done since the moment given. */
export async function getRecentDoneTimes(
	supabase: SupabaseClient,
	projectId: string,
	since: Date
): Promise<Map<string, string>> {
	const { data, error } = await supabase
		.from('project_events')
		.select('task_id, created_at')
		.eq('project_id', projectId)
		.eq('kind', feedEventKinds.done)
		.gte('created_at', since.toISOString())
		.order('created_at', { ascending: true });
	if (error) throw error;
	const doneAtByTask = new Map<string, string>();
	for (const row of data ?? []) doneAtByTask.set(row.task_id as string, row.created_at as string);
	return doneAtByTask;
}
