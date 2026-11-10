import type { SupabaseClient } from '@supabase/supabase-js';
import { businessBrainReadLimits } from '$lib/data/businessBrainRules';
import { readBusinessBrainSource, type BusinessBrainSourceRead } from './readBusinessBrainPageWhole';

/** One earlier version of a page as its history lists it. */
export type BusinessBrainRevisionEntry = { revisionId: number; title: string; revisedAt: string };

/** One earlier version of a page, whole: the words it read before it was revised and where they came from. */
export type BusinessBrainRevisionRead = BusinessBrainRevisionEntry & {
	kind: string;
	summary: string;
	body: string;
	source: BusinessBrainSourceRead | null;
};

/** The page's earlier versions, latest first, and how many it has in all. */
export async function readBusinessBrainPageHistory(
	supabase: SupabaseClient,
	organisationId: string,
	pageId: string
): Promise<{ entries: BusinessBrainRevisionEntry[]; revisionCount: number }> {
	const { data, error, count } = await supabase
		.from('business_brain_page_revisions')
		.select('id, title, revised_at', { count: 'exact' })
		.eq('organisation_id', organisationId)
		.eq('page_id', pageId)
		.order('revised_at', { ascending: false })
		.limit(businessBrainReadLimits.mostRevisionsListed);
	if (error) throw error;
	const entries = (data ?? []).map((row) => ({
		revisionId: row.id as number,
		title: row.title as string,
		revisedAt: row.revised_at as string
	}));
	return { entries, revisionCount: count ?? entries.length };
}

/** One earlier version of the page, or null when the page's history holds none by that id. */
export async function readBusinessBrainRevision(
	supabase: SupabaseClient,
	place: { organisationId: string; pageId: string },
	revisionId: number
): Promise<BusinessBrainRevisionRead | null> {
	const { data, error } = await supabase
		.from('business_brain_page_revisions')
		.select('id, source_id, kind, title, summary, body, revised_at')
		.eq('id', revisionId)
		.eq('organisation_id', place.organisationId)
		.eq('page_id', place.pageId)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	const source = await readBusinessBrainSource(supabase, place.organisationId, data.source_id as string | null);
	const { id, source_id: _sourceId, revised_at: revisedAt, ...words } = data;
	return { revisionId: id, revisedAt, source, ...words } as BusinessBrainRevisionRead;
}
