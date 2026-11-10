import type { SupabaseClient } from '@supabase/supabase-js';

export type DirectorNaming = { organisationId: string; accountId: string; name: string; namedBy: string };

/** Seat someone on an organisation's board: a new row, so every earlier directorship of theirs stays as it was. */
export async function nameBoardroomDirector(supabase: SupabaseClient, naming: DirectorNaming): Promise<void> {
	const { error } = await supabase.from('boardroom_directors').insert({
		organisation_id: naming.organisationId,
		account_id: naming.accountId,
		director_name: naming.name,
		named_by: naming.namedBy
	});
	if (error) throw error;
}
