import type { SupabaseClient } from '@supabase/supabase-js';
import type { BusinessBrainPartKind } from '$lib/data/businessBrainRules';
import { readPartKinds } from './readBusinessBrainIndex';

/** Where a page's words came from, as it was filed. */
export type BusinessBrainSourceRead = { sourceId: string; title: string; origin: string; summary: string; filedAt: string };

/** A page as a client's Claude reads it: its words, its facts, its part and its source. */
export type BusinessBrainPageRead = {
	pageId: string;
	partKind: BusinessBrainPartKind;
	parentPageId: string | null;
	kind: string;
	title: string;
	summary: string;
	body: string;
	facts: Record<string, unknown>;
	source: BusinessBrainSourceRead | null;
	updatedAt: string;
};

const pageColumns = 'id, part_id, parent_page_id, source_id, kind, title, summary, body, facts, updated_at';

/** The organisation's page as it now reads, or null when the organisation has no page by that id. */
export async function readBusinessBrainPageWhole(
	supabase: SupabaseClient,
	organisationId: string,
	pageId: string
): Promise<BusinessBrainPageRead | null> {
	const { data: row, error } = await supabase
		.from('business_brain_pages')
		.select(pageColumns)
		.eq('id', pageId)
		.eq('organisation_id', organisationId)
		.maybeSingle();
	if (error) throw error;
	if (row === null) return null;
	const partKinds = await readPartKinds(supabase, organisationId);
	const source = await readBusinessBrainSource(supabase, organisationId, row.source_id as string | null);
	return {
		pageId: row.id as string,
		partKind: partKinds.get(row.part_id as string) as BusinessBrainPartKind,
		parentPageId: row.parent_page_id as string | null,
		kind: row.kind as string,
		title: row.title as string,
		summary: row.summary as string,
		body: row.body as string,
		facts: row.facts as Record<string, unknown>,
		source,
		updatedAt: row.updated_at as string
	};
}

/** The organisation's source by its id, or null when none is given or it has none by that id. */
export async function readBusinessBrainSource(
	supabase: SupabaseClient,
	organisationId: string,
	sourceId: string | null
): Promise<BusinessBrainSourceRead | null> {
	if (sourceId === null) return null;
	const { data, error } = await supabase
		.from('business_brain_sources')
		.select('id, title, origin, summary, filed_at')
		.eq('id', sourceId)
		.eq('organisation_id', organisationId)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	const { id, filed_at: filedAt, ...words } = data;
	return { sourceId: id, filedAt, ...words } as BusinessBrainSourceRead;
}
