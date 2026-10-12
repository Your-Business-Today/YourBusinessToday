import type { SupabaseClient } from '@supabase/supabase-js';

export const longestStatusNote = 120;

/** Why the note cannot go on the register row, or null when it fits its column. */
export function validateStatusNote(note: string): string | null {
	if (note.length > longestStatusNote) return `A status note is at most ${longestStatusNote} characters.`;
	return null;
}

export async function recordStatusNote(supabase: SupabaseClient, companyNumber: string, note: string): Promise<void> {
	const refusal = validateStatusNote(note);
	if (refusal !== null) throw new Error(refusal);
	const { error } = await supabase.from('register_companies').update({ status_note: note }).eq('company_number', companyNumber);
	if (error) throw error;
}
