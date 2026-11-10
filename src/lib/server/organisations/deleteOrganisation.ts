import type { SupabaseClient } from '@supabase/supabase-js';

const PostgresErrorCode = { ForeignKeyViolation: '23503' } as const;

/**
 * Deletes an organisation and answers null; its projects stay, under no organisation,
 * and the project memberships it granted go with it. An organisation still holding records that are always kept,
 * such as its books, its Your Business Brain or the directors named to its board, is refused by the database and answers why, deleting nothing.
 */
export async function deleteOrganisation(supabase: SupabaseClient, organisationId: string): Promise<string | null> {
	const { error } = await supabase.from('organisations').delete().eq('id', organisationId);
	if (error === null) return null;
	const isStillHoldingKeptRecords = error.code === PostgresErrorCode.ForeignKeyViolation;
	if (isStillHoldingKeptRecords) return refusalWhileHoldingKeptRecords;
	throw error;
}

const refusalWhileHoldingKeptRecords =
	'This organisation still holds records that are always kept, such as its books, its Your Business Brain or the directors named to its board, so it was not deleted.';
