import type { SupabaseClient } from '@supabase/supabase-js';

/** How many uploads one person has started on a task since a moment — what an upload page has let through so far. */
export async function countUploadGrantsSince(
	supabase: SupabaseClient,
	taskId: string,
	grantedTo: string,
	since: string
): Promise<number> {
	const { count, error } = await supabase
		.from('task_upload_grants')
		.select('id', { count: 'exact', head: true })
		.eq('task_id', taskId)
		.eq('granted_to', grantedTo)
		.gte('created_at', since);
	if (error) throw error;
	return count ?? 0;
}
