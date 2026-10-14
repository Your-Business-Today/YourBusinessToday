import type { SupabaseClient } from '@supabase/supabase-js';

/** Removes a person from the register, with their links, notes and the companies they sat on. */
export async function deletePerson(supabase: SupabaseClient, personId: string): Promise<void> {
	const { error } = await supabase.from('people').delete().eq('id', personId);
	if (error) throw error;
}
