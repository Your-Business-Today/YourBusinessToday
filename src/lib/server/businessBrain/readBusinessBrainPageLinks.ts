import type { SupabaseClient } from '@supabase/supabase-js';

/** Another page this one points at, or that points at it, and why. */
export type BusinessBrainLinkRead = { pageId: string; title: string; linkKind: string; isFromThisPage: boolean };

type LinkRow = { from_page_id: string; to_page_id: string; link_kind: string };

/** The pages the page links to and the pages that link to it, with their titles. */
export async function readBusinessBrainPageLinks(
	supabase: SupabaseClient,
	organisationId: string,
	pageId: string
): Promise<BusinessBrainLinkRead[]> {
	const { data, error } = await supabase
		.from('business_brain_page_links')
		.select('from_page_id, to_page_id, link_kind')
		.eq('organisation_id', organisationId)
		.or(`from_page_id.eq.${pageId},to_page_id.eq.${pageId}`);
	if (error) throw error;
	const links = (data ?? []) as LinkRow[];
	const otherPageIds = links.map((link) => otherPageOf(link, pageId));
	const titles = await readPageTitles(supabase, organisationId, otherPageIds);
	return links.map((link) => {
		const otherPageId = otherPageOf(link, pageId);
		return { pageId: otherPageId, title: titles.get(otherPageId) ?? '', linkKind: link.link_kind, isFromThisPage: link.from_page_id === pageId };
	});
}

/** The title of each of the organisation's pages named, by its id. */
export async function readPageTitles(supabase: SupabaseClient, organisationId: string, pageIds: string[]): Promise<Map<string, string>> {
	if (pageIds.length === 0) return new Map();
	const { data, error } = await supabase
		.from('business_brain_pages')
		.select('id, title')
		.eq('organisation_id', organisationId)
		.in('id', pageIds);
	if (error) throw error;
	return new Map((data ?? []).map((row) => [row.id as string, row.title as string]));
}

function otherPageOf(link: LinkRow, pageId: string): string {
	if (link.from_page_id === pageId) return link.to_page_id;
	return link.from_page_id;
}
