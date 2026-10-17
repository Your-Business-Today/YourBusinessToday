import type { SupabaseClient } from '@supabase/supabase-js';
import type { AutocompleteSetting } from '$lib/data/autocomplete';

/** A task's own autocomplete setting; null hands it back to its goal. */
export async function setTaskAutocomplete(
	supabase: SupabaseClient,
	taskId: string,
	setting: AutocompleteSetting
): Promise<void> {
	const { error } = await supabase.from('tasks').update({ is_autocomplete: setting }).eq('id', taskId);
	if (error) throw error;
}
