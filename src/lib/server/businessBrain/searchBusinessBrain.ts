import type { SupabaseClient } from '@supabase/supabase-js';
import { businessBrainReadLimits } from '$lib/data/businessBrainRules';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import type { BusinessBrainIndexEntry } from './readBusinessBrainIndex';

/** A page that matches a search, with the words of its body around the match. */
export type BusinessBrainPageMatch = BusinessBrainIndexEntry & { excerpt: string };

type SearchRow = {
	page_id: string;
	part_kind: BusinessBrainIndexEntry['partKind'];
	kind: string;
	title: string;
	summary: string;
	excerpt: string;
	updated_at: string;
};

/**
 * The organisation's pages that match the words, best first, as search_business_brain (migration 0158)
 * ranks them; null while that migration has not run yet.
 */
export async function searchBusinessBrain(
	supabase: SupabaseClient,
	organisationId: string,
	searchText: string
): Promise<BusinessBrainPageMatch[] | null> {
	const search = {
		target_organisation: organisationId,
		search_text: searchText,
		most_pages: businessBrainReadLimits.mostPagesFound
	};
	const { data, error } = await supabase.rpc('search_business_brain', search);
	if (isSchemaNotYetMigrated(error)) return null;
	if (error) throw error;
	return ((data ?? []) as SearchRow[]).map((row) => ({
		pageId: row.page_id,
		partKind: row.part_kind,
		kind: row.kind,
		title: row.title,
		summary: row.summary,
		excerpt: row.excerpt,
		updatedAt: row.updated_at
	}));
}
