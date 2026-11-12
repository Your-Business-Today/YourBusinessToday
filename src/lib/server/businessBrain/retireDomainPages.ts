import { domainPageOutcomes, keepDomainPage, type DomainPageKept, type DomainPagePlace } from './keepDomainPage';
import { isDomainPageStanding, readDomainPageStanding, valuesOfStanding } from './domainPageStanding';
import { supersededLinkKind, supersededPageKind, type DomainRetireGiven } from '$lib/data/businessBrainDomainRules';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Supersedes each page the modelling folded into another: it leaves the domain by taking the kind superseded,
 * its body says where its knowledge went, its earlier version stays in its history and it links to the page
 * that took its knowledge in. Nothing is deleted.
 */
export async function retireDomainPages(
	supabase: SupabaseClient,
	place: DomainPagePlace,
	retires: DomainRetireGiven[],
	pagesKept: DomainPageKept[]
): Promise<DomainPageKept[]> {
	const retired: DomainPageKept[] = [];
	for (const retire of retires) {
		const foldedInto = pagesKept.find((kept) => kept.slug === retire.foldedIntoSlug);
		retired.push(await retireDomainPage(supabase, place, retire.slug, foldedInto));
	}
	return retired;
}

async function retireDomainPage(
	supabase: SupabaseClient,
	place: DomainPagePlace,
	slug: string,
	foldedInto: DomainPageKept | undefined
): Promise<DomainPageKept> {
	const standing = await readDomainPageStanding(supabase, place.partId, slug);
	const isRetirable = standing !== null && isDomainPageStanding(standing) && foldedInto?.pageId != null;
	if (!isRetirable) return { slug, title: slug, pageId: standing?.pageId ?? null, outcome: domainPageOutcomes.notInDomain };
	const body = `Superseded: what this page knew was folded into "${foldedInto.title}" (${foldedInto.slug}).`;
	const values = { ...valuesOfStanding(standing), kind: supersededPageKind, body };
	const kept = await keepDomainPage(supabase, place, values);
	await linkToSuccessor(supabase, place.organisationId, standing.pageId, foldedInto.pageId as string);
	return kept;
}

async function linkToSuccessor(supabase: SupabaseClient, organisationId: string, fromPageId: string, toPageId: string): Promise<void> {
	const link = { organisation_id: organisationId, from_page_id: fromPageId, to_page_id: toPageId, link_kind: supersededLinkKind };
	const { error } = await supabase.from('business_brain_page_links').upsert(link, { onConflict: 'from_page_id,to_page_id,link_kind', ignoreDuplicates: true });
	if (error) throw error;
}
