import type { SupabaseClient } from '@supabase/supabase-js';
import { businessBrainReadLimits, type BusinessBrainPartKind } from '$lib/data/businessBrainRules';
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

const { mostPagesFound } = businessBrainReadLimits;

/**
 * The organisation's pages that match the words, best first, as search_business_brain (migration 0158)
 * ranks them; null while that migration has not run yet.
 */
export async function searchBusinessBrain(
	supabase: SupabaseClient,
	organisationId: string,
	searchText: string
): Promise<BusinessBrainPageMatch[] | null> {
	const search = { target_organisation: organisationId, search_text: searchText, most_pages: mostPagesFound };
	return matchesOf(await supabase.rpc('search_business_brain', search));
}

/**
 * The organisation's pages in the parts named that match the words, best first, as
 * search_business_brain_parts (migration 0167) ranks them; null while that migration has not run yet.
 */
export async function searchBusinessBrainParts(
	supabase: SupabaseClient,
	organisationId: string,
	searchText: string,
	parts: BusinessBrainPartKind[]
): Promise<BusinessBrainPageMatch[] | null> {
	const search = { target_organisation: organisationId, search_text: searchText, part_kinds: parts, most_pages: mostPagesFound };
	return matchesOf(await supabase.rpc('search_business_brain_parts', search));
}

/**
 * A product's own pages that match the words, then the organisation's pages in the parts tied to it, best first
 * within each, as search_product_brain (migration 0203) ranks them; before that migration, the parts alone.
 */
export async function searchProductBrainPages(
	supabase: SupabaseClient,
	scope: { organisationId: string; projectId: string },
	searchText: string,
	parts: BusinessBrainPartKind[]
): Promise<BusinessBrainPageMatch[] | null> {
	const { organisationId, projectId } = scope;
	const search = { target_organisation: organisationId, target_project: projectId, search_text: searchText, part_kinds: parts, most_pages: mostPagesFound };
	const matches = matchesOf(await supabase.rpc('search_product_brain', search));
	if (matches !== null) return matches;
	return searchBusinessBrainParts(supabase, organisationId, searchText, parts);
}

function matchesOf(answer: { data: unknown; error: unknown }): BusinessBrainPageMatch[] | null {
	const { data, error } = answer;
	if (isSchemaNotYetMigrated(error)) return null;
	if (error) throw error;
	return ((data ?? []) as SearchRow[]).map(matchOf);
}

function matchOf(row: SearchRow): BusinessBrainPageMatch {
	return {
		pageId: row.page_id,
		partKind: row.part_kind,
		kind: row.kind,
		title: row.title,
		summary: row.summary,
		excerpt: row.excerpt,
		updatedAt: row.updated_at
	};
}
