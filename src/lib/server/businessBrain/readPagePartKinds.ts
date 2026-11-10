import type { SupabaseClient } from '@supabase/supabase-js';
import type { BusinessBrainPartKind } from '$lib/data/businessBrainRules';
import { readPartKinds } from './readBusinessBrainIndex';

/** The part each of the organisation's pages named is kept in, by page id. */
export async function readPagePartKinds(
	supabase: SupabaseClient,
	organisationId: string,
	pageIds: string[]
): Promise<Map<string, BusinessBrainPartKind>> {
	if (pageIds.length === 0) return new Map();
	const partKinds = await readPartKinds(supabase, organisationId);
	const { data, error } = await supabase
		.from('business_brain_pages')
		.select('id, part_id')
		.eq('organisation_id', organisationId)
		.in('id', pageIds);
	if (error) throw error;
	return new Map((data ?? []).map((row) => [row.id as string, partKinds.get(row.part_id as string) as BusinessBrainPartKind]));
}
