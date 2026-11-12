import type { SupabaseClient } from '@supabase/supabase-js';

/** The body of each of the organisation's pages named, by page id. */
export async function readBodiesByPageId(supabase: SupabaseClient, organisationId: string, pageIds: string[]): Promise<Map<string, string>> {
	if (pageIds.length === 0) return new Map();
	const { data, error } = await supabase
		.from('business_brain_pages')
		.select('id, body')
		.eq('organisation_id', organisationId)
		.in('id', pageIds);
	if (error) throw error;
	return new Map((data ?? []).map((row) => [row.id as string, row.body as string]));
}
