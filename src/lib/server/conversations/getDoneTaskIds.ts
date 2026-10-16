import type { SupabaseClient } from '@supabase/supabase-js';
import { doneTaskStatus } from '$lib/data/taskStatus';

/** Which of these tasks are done. */
export async function getDoneTaskIds(
	supabase: SupabaseClient,
	taskIds: string[]
): Promise<Set<string>> {
	if (taskIds.length === 0) return new Set();
	const { data, error } = await supabase
		.from('tasks')
		.select('id')
		.in('id', taskIds)
		.eq('status', doneTaskStatus);
	if (error) throw error;
	return new Set(data.map((row) => row.id as string));
}
