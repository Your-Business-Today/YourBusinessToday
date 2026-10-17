import type { SupabaseClient } from '@supabase/supabase-js';

export async function setGoalAutocomplete(
	supabase: SupabaseClient,
	goalId: string,
	isAutocomplete: boolean
): Promise<void> {
	const { error } = await supabase.from('goals').update({ is_autocomplete: isAutocomplete }).eq('id', goalId);
	if (error) throw error;
}
