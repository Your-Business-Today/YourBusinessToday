import type { SupabaseClient } from '@supabase/supabase-js';

/** Set or clear the day a task is due, leaving everything else about it as it was. */
export async function setTaskDueDate(supabase: SupabaseClient, taskId: string, dueDate: string | null): Promise<void> {
	const { error } = await supabase.from('tasks').update({ due_date: dueDate }).eq('id', taskId);
	if (error) throw error;
}
