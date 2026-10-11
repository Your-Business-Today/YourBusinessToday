import type { SupabaseClient } from '@supabase/supabase-js';

/** Deleting an organisation takes its sub-organisations and the project memberships it granted with it; its projects stay, under no organisation. */
export async function deleteOrganisation(supabase: SupabaseClient, organisationId: string): Promise<void> {
	const { error } = await supabase.from('organisations').delete().eq('id', organisationId);
	if (error) throw error;
}
