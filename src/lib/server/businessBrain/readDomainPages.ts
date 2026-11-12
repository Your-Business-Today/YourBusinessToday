import { domainBrainPart, everyDomainPageKind, type DomainPageKind } from '$lib/data/businessBrainDomain';
import { readDomainPageFacts } from '$lib/data/businessBrainDomainFacts';
import type { DomainPage } from '$lib/data/organisationDomain';
import type { SupabaseClient } from '@supabase/supabase-js';
import { readInScope, type DomainScope } from './domainScope';
import { readPartKinds } from './readBusinessBrainIndex';

/** The most domain pages one reading takes: far more than the one to three contexts a domain holds need. */
export const mostDomainPagesRead = 1000;

/** Every page of the Expertise part filed in one of the domain's kinds: the organisation's own, or one product's. */
export async function readDomainPages(supabase: SupabaseClient, scope: DomainScope): Promise<DomainPage[]> {
	const { organisationId } = scope;
	const partId = await readDomainPartId(supabase, organisationId);
	if (partId === null) return [];
	const data = await readInScope(scope, (filter) =>
		supabase
			.from('business_brain_pages')
			.select('id, parent_page_id, kind, slug, title, summary, facts')
			.eq('organisation_id', organisationId)
			.eq('part_id', partId)
			.in('kind', everyDomainPageKind)
			.filter(...filter)
			.order('position')
			.order('title')
			.range(0, mostDomainPagesRead - 1)
	);
	return (data ?? []).map((row) => ({
		pageId: row.id as string,
		parentPageId: row.parent_page_id as string | null,
		kind: row.kind as DomainPageKind,
		slug: row.slug as string,
		title: row.title as string,
		summary: row.summary as string,
		facts: readDomainPageFacts(row.facts)
	}));
}

export async function readDomainPartId(supabase: SupabaseClient, organisationId: string): Promise<string | null> {
	const partKinds = await readPartKinds(supabase, organisationId);
	const partIds = [...partKinds.keys()];
	return partIds.find((partId) => partKinds.get(partId) === domainBrainPart) ?? null;
}
