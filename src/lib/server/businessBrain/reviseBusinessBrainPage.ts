import type { SupabaseClient } from '@supabase/supabase-js';
import type { BusinessBrainRevisionGiven } from '$lib/data/businessBrainRules';

/** A page as it stands before a revision: every value its history keeps. */
export type BusinessBrainPageStanding = {
	pageId: string;
	sourceId: string | null;
	kind: string;
	title: string;
	summary: string;
	body: string;
	facts: Record<string, unknown>;
	updatedAt: string;
};

/** The organisation's page as it stands, or null when the organisation has no page by that id. */
export async function readBusinessBrainPage(
	supabase: SupabaseClient,
	organisationId: string,
	pageId: string
): Promise<BusinessBrainPageStanding | null> {
	const { data, error } = await supabase
		.from('business_brain_pages')
		.select('id, source_id, kind, title, summary, body, facts, updated_at')
		.eq('id', pageId)
		.eq('organisation_id', organisationId)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	const { id, source_id: sourceId, facts, updated_at: updatedAt, ...words } = data;
	return { pageId: id, sourceId, facts, updatedAt, ...words } as BusinessBrainPageStanding;
}

/**
 * Keeps the page as it stood in its history, then gives it the revision. The history is written
 * first, so the earlier version is never lost; true when the page took the revision, false when
 * someone else revised it since it was read, and it was left as they made it.
 */
export async function reviseBusinessBrainPage(
	supabase: SupabaseClient,
	standing: BusinessBrainPageStanding & { organisationId: string; reviserAccountId: string },
	revision: BusinessBrainRevisionGiven & { sourceId: string }
): Promise<boolean> {
	const { organisationId, pageId, sourceId, kind, title, summary, body, facts, reviserAccountId } = standing;
	const earlierVersion = { organisation_id: organisationId, page_id: pageId, source_id: sourceId, kind, title, summary, body, facts, revised_by: reviserAccountId };
	const { error: historyError } = await supabase.from('business_brain_page_revisions').insert(earlierVersion);
	if (historyError) throw historyError;
	const { data, error } = await supabase
		.from('business_brain_pages')
		.update(revisedValues(standing, revision))
		.eq('id', pageId)
		.eq('organisation_id', organisationId)
		.eq('updated_at', standing.updatedAt)
		.select('id');
	if (error) throw error;
	return (data ?? []).length > 0;
}

function revisedValues(standing: BusinessBrainPageStanding, revision: BusinessBrainRevisionGiven & { sourceId: string }) {
	return {
		source_id: revision.sourceId,
		kind: revision.kind ?? standing.kind,
		title: revision.title,
		summary: revision.summary ?? standing.summary,
		body: revision.body,
		updated_at: new Date().toISOString()
	};
}
