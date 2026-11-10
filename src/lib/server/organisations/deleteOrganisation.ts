import type { SupabaseClient } from '@supabase/supabase-js';

const foreignKeyViolation = '23503';

export const keepsBoardRecords =
	'This organisation, or a business under it, keeps a board record — its named directors — which is never deleted, so the organisation cannot be deleted.';

/**
 * Deleting an organisation takes its sub-organisations and the project memberships it granted with it; its projects stay,
 * under no organisation. One that keeps board records is refused by the database, and the refusal is returned.
 */
export async function deleteOrganisation(supabase: SupabaseClient, organisationId: string): Promise<string | null> {
	const { error } = await supabase.from('organisations').delete().eq('id', organisationId);
	if (error?.code === foreignKeyViolation) return keepsBoardRecords;
	if (error) throw error;
	return null;
}
