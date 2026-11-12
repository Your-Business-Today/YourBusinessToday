import { organisationOwnPages, readInScope } from './domainScope';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { BusinessBrainPageGiven } from '$lib/data/businessBrainRules';

/** A page already filed on a subject: its id and its title. */
export type BusinessBrainPageFound = { pageId: string; title: string };

/** What filing a new page did: kept it, or found a page on the same subject already in the part. */
export type BusinessBrainPageFiling = { isNew: true; pageId: string } | ({ isNew: false } & BusinessBrainPageFound);

const uniqueViolation = '23505';

/** The organisation's own page of the part filed under the slug, or null when the subject is new to it. */
export async function findBusinessBrainPage(
	supabase: SupabaseClient,
	partId: string,
	slug: string
): Promise<BusinessBrainPageFound | null> {
	const data = await readInScope(organisationOwnPages, (filter) =>
		supabase.from('business_brain_pages').select('id, title').eq('part_id', partId).eq('slug', slug).filter(...filter).maybeSingle()
	);
	if (data === null) return null;
	return { pageId: data.id as string, title: data.title as string };
}

/** Keeps the new page in the part; a page filed under the same slug in the meantime is answered, not replaced. */
export async function fileBusinessBrainPage(
	supabase: SupabaseClient,
	place: { organisationId: string; partId: string; sourceId: string },
	page: BusinessBrainPageGiven
): Promise<BusinessBrainPageFiling> {
	const row = {
		organisation_id: place.organisationId,
		part_id: place.partId,
		source_id: place.sourceId,
		kind: page.kind,
		slug: page.slug,
		title: page.title,
		summary: page.summary,
		body: page.body
	};
	const { data, error } = await supabase.from('business_brain_pages').insert(row).select('id').single();
	if (error?.code === uniqueViolation) return pageFiledMeanwhile(supabase, place.partId, page.slug);
	if (error) throw error;
	return { isNew: true, pageId: data.id as string };
}

async function pageFiledMeanwhile(supabase: SupabaseClient, partId: string, slug: string): Promise<BusinessBrainPageFiling> {
	const found = await findBusinessBrainPage(supabase, partId, slug);
	if (found === null) throw new Error(`A page under ${slug} was refused as already filed, yet none is there.`);
	return { isNew: false, ...found };
}
