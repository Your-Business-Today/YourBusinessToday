import type { SupabaseClient } from '@supabase/supabase-js';

/** The brand tables a reading can be for. */
export type ReadingSubjectTable = 'brand_content_pieces' | 'brand_campaigns';

/** Which of the ids are records the organisation's brand holds in the table. */
export async function findBrandRecordIds(
	supabase: SupabaseClient,
	table: ReadingSubjectTable,
	organisationId: string,
	ids: string[]
): Promise<Set<string>> {
	if (ids.length === 0) return new Set();
	const { data, error } = await supabase.from(table).select('id').eq('organisation_id', organisationId).in('id', ids);
	if (error) throw error;
	return new Set(((data ?? []) as { id: string }[]).map((row) => row.id));
}
