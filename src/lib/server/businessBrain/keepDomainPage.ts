import { everyDomainPageKind } from '$lib/data/businessBrainDomain';
import { keepEarlierVersion } from './reviseBusinessBrainPage';
import { readDomainPageStanding, readsAsFiled, type DomainPageStanding, type DomainPageValues } from './domainPageStanding';
import { supersededPageKind } from '$lib/data/businessBrainDomainRules';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Where a domain page is kept, the source it is filed from and who files it. */
export type DomainPagePlace = { organisationId: string; partId: string; sourceId: string; filerAccountId: string };

export const domainPageOutcomes = {
	filed: 'filed',
	revised: 'revised',
	unchanged: 'unchanged',
	revisedMeanwhile: 'revisedMeanwhile',
	notInDomain: 'notInDomain'
} as const;

export type DomainPageOutcome = (typeof domainPageOutcomes)[keyof typeof domainPageOutcomes];

/** What became of one page: its id when it is kept, and what was done. */
export type DomainPageKept = { slug: string; title: string; pageId: string | null; outcome: DomainPageOutcome };

const kindsAFilingMayRevise: string[] = [...everyDomainPageKind, supersededPageKind];

/** Files the page under its slug, or revises the page already there, keeping its earlier version in its history. */
export async function keepDomainPage(supabase: SupabaseClient, place: DomainPagePlace, values: DomainPageValues): Promise<DomainPageKept> {
	const kept = { slug: values.slug, title: values.title };
	const standing = await readDomainPageStanding(supabase, place.partId, values.slug);
	if (standing === null) return { ...kept, pageId: await insertDomainPage(supabase, place, values), outcome: domainPageOutcomes.filed };
	const { pageId } = standing;
	if (!kindsAFilingMayRevise.includes(standing.kind)) return { ...kept, pageId, outcome: domainPageOutcomes.notInDomain };
	if (readsAsFiled(standing, values)) return { ...kept, pageId, outcome: domainPageOutcomes.unchanged };
	const isRevised = await reviseDomainPage(supabase, place, standing, values);
	return { ...kept, pageId, outcome: isRevised ? domainPageOutcomes.revised : domainPageOutcomes.revisedMeanwhile };
}

async function insertDomainPage(supabase: SupabaseClient, place: DomainPagePlace, values: DomainPageValues): Promise<string> {
	const { organisationId, partId, sourceId } = place;
	const { kind, slug, title, summary, body, facts, parentPageId } = values;
	const row = { organisation_id: organisationId, part_id: partId, source_id: sourceId, parent_page_id: parentPageId, kind, slug, title, summary, body, facts };
	const { data, error } = await supabase.from('business_brain_pages').insert(row).select('id').single();
	if (error) throw error;
	return data.id as string;
}

/** True when the page took the revision; false when someone revised it since it was read, and it was left as they made it. */
async function reviseDomainPage(
	supabase: SupabaseClient,
	place: DomainPagePlace,
	standing: DomainPageStanding,
	values: DomainPageValues
): Promise<boolean> {
	const { organisationId, sourceId, filerAccountId } = place;
	await keepEarlierVersion(supabase, { ...standing, organisationId, reviserAccountId: filerAccountId });
	const { kind, title, summary, body, facts, parentPageId } = values;
	const revised = { source_id: sourceId, parent_page_id: parentPageId, kind, title, summary, body, facts, updated_at: new Date().toISOString() };
	const { data, error } = await supabase
		.from('business_brain_pages')
		.update(revised)
		.eq('id', standing.pageId)
		.eq('organisation_id', organisationId)
		.eq('updated_at', standing.updatedAt)
		.select('id');
	if (error) throw error;
	return (data ?? []).length > 0;
}
