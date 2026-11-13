import { drawBusinessBrain, type BusinessBrainDrawing, type FiledPageLink } from '$lib/data/businessBrainDrawing';
import type { SupabaseClient } from '@supabase/supabase-js';
import { organisationOwnPages, readInScope } from './domainScope';

/** The most pages the drawn brain takes: far more than a business files, and few enough to draw smoothly. */
export const mostPagesDrawn = 1000;

/** The organisation's brain as it is drawn: every page it keeps and every link filed between them. Reads only. */
export async function readBusinessBrainDrawing(supabase: SupabaseClient, organisationId: string): Promise<BusinessBrainDrawing> {
	const [pages, filedLinks] = await Promise.all([readDrawnPages(supabase, organisationId), readFiledLinks(supabase, organisationId)]);
	return drawBusinessBrain(pages, filedLinks);
}

async function readDrawnPages(supabase: SupabaseClient, organisationId: string) {
	const data = await readInScope(organisationOwnPages, (filter) =>
		supabase
			.from('business_brain_pages')
			.select('id, part_id, parent_page_id, kind, slug, title, summary, facts')
			.eq('organisation_id', organisationId)
			.filter(...filter)
			.order('position')
			.order('title')
			.range(0, mostPagesDrawn - 1)
	);
	return (data ?? []).map((row) => ({
		id: row.id as string,
		partId: row.part_id as string,
		parentPageId: row.parent_page_id as string | null,
		kind: row.kind as string,
		slug: row.slug as string,
		title: row.title as string,
		summary: row.summary as string,
		facts: row.facts as unknown
	}));
}

async function readFiledLinks(supabase: SupabaseClient, organisationId: string): Promise<FiledPageLink[]> {
	const { data, error } = await supabase
		.from('business_brain_page_links')
		.select('from_page_id, to_page_id')
		.eq('organisation_id', organisationId)
		.range(0, mostPagesDrawn - 1);
	if (error) throw error;
	return (data ?? []).map((row) => ({ fromPageId: row.from_page_id as string, toPageId: row.to_page_id as string }));
}
