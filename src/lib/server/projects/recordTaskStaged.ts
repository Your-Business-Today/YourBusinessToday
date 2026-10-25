import type { SupabaseClient } from '@supabase/supabase-js';

/** Record that a task's work reached staging, where it waits for the next promotion to go live. */
export async function recordTaskStaged(
	supabase: SupabaseClient,
	taskId: string,
	stagedAt: Date
): Promise<void> {
	const { error } = await supabase
		.from('tasks')
		.update({ staged_at: stagedAt.toISOString() })
		.eq('id', taskId);
	if (error) throw error;
}
