import { readPageTitles } from './readBusinessBrainPageLinks';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The page another page is filed under, by its id and title. */
export type BusinessBrainParentPage = { pageId: string; title: string };

/** The page this one is filed under, or null when it stands on its own. */
export async function readBusinessBrainParentPage(
	supabase: SupabaseClient,
	organisationId: string,
	parentPageId: string | null
): Promise<BusinessBrainParentPage | null> {
	if (parentPageId === null) return null;
	const titles = await readPageTitles(supabase, organisationId, [parentPageId]);
	const title = titles.get(parentPageId);
	if (title === undefined) return null;
	return { pageId: parentPageId, title };
}
