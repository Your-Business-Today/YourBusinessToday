import type { SupabaseClient } from '@supabase/supabase-js';

/** A record of an organisation's books a write points at, and whether it is archived. */
export type BooksRecord = { id: string; is_archived?: boolean };

/** The records of the table that are the organisation's and have one of the ids; none when no id is given. */
export async function findOrganisationRecords<HeldRecord extends BooksRecord = BooksRecord>(
	supabase: SupabaseClient,
	table: string,
	organisationId: string,
	ids: string[],
	columns = 'id, is_archived'
): Promise<HeldRecord[]> {
	if (ids.length === 0) return [];
	const { data, error } = await supabase.from(table).select(columns).eq('organisation_id', organisationId).in('id', ids);
	if (error !== null) throw error;
	return data as unknown as HeldRecord[];
}

/** Why one of the ids is not a record the organisation can use, missing or archived, or null when every one is. */
export function unusableRecordRefusal(recordName: string, ids: string[], records: BooksRecord[]): string | null {
	const missingId = ids.find((id) => !records.some((record) => record.id === id));
	if (missingId !== undefined) return `No ${recordName} ${missingId} is in this organisation's books.`;
	const archived = records.find((record) => record.is_archived === true);
	if (archived !== undefined) return `The ${recordName} ${archived.id} is archived, so nothing posts to it.`;
	return null;
}
