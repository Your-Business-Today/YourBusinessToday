import type { SupabaseClient } from '@supabase/supabase-js';
import type { Department } from '$lib/data/department';

/** Moves a goal to another department's tab; its tasks keep their own departments. */
export async function setGoalDepartment(
	supabase: SupabaseClient,
	goalId: string,
	department: Department
): Promise<void> {
	const { error } = await supabase.from('goals').update({ department }).eq('id', goalId);
	if (error) throw error;
}
