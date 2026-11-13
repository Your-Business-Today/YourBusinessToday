import { pageAsShown, type FactLine } from '$lib/components/businessBrain/businessBrainPageShown';
import { readBusinessBrainPageWhole } from './readBusinessBrainPageWhole';
import { readFilesNamedByPage } from './readKeptBusinessBrainFiles';
import type { SupabaseClient } from '@supabase/supabase-js';

/** What the drawn brain shows of a page when its neuron is opened: its words, its facts, when it was filed and what it was filed from. */
export type BusinessBrainPageGlance = {
	body: string;
	facts: FactLine[];
	updatedAt: string;
	sourceTitle: string | null;
	sourceFileCount: number;
};

const asItNowReads = null;

/** The organisation's page as its neuron shows it, or null when the organisation has no page by that id. Reads only. */
export async function readBusinessBrainPageGlance(
	supabase: SupabaseClient,
	place: { organisationId: string; pageId: string }
): Promise<BusinessBrainPageGlance | null> {
	const [page, sourceFiles] = await Promise.all([
		readBusinessBrainPageWhole(supabase, place.organisationId, place.pageId),
		readFilesNamedByPage(supabase, place)
	]);
	if (page === null) return null;
	const { body, facts, source } = pageAsShown(page, asItNowReads);
	const sourceTitle = source === null ? null : source.title;
	return { body, facts, updatedAt: page.updatedAt, sourceTitle, sourceFileCount: sourceFiles.length };
}
