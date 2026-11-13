import { everyDomainPageKind } from '$lib/data/businessBrainDomain';
import { mostDomainPagesRead, readDomainPartId } from './readDomainPages';
import { readInScope, type DomainScope } from './domainScope';
import { supersededPageKind } from '$lib/data/businessBrainDomainRules';
import type { SupabaseClient } from '@supabase/supabase-js';

/** What the domain check reads beyond the domain itself: each page's body by its id, and the slugs of the pages retired from it. */
export type DomainCheckPages = { bodies: Map<string, string>; retiredSlugs: string[] };

type PageRow = { id: string; slug: string; kind: string; body: string };

/** The bodies of the domain's pages and the slugs it retired, read in one go from the part the domain is filed in. */
export async function readDomainCheckPages(supabase: SupabaseClient, scope: DomainScope): Promise<DomainCheckPages> {
	const { organisationId } = scope;
	const partId = await readDomainPartId(supabase, organisationId);
	if (partId === null) return { bodies: new Map(), retiredSlugs: [] };
	const kinds = [...everyDomainPageKind, supersededPageKind];
	const data = await readInScope(scope, (filter) =>
		supabase
			.from('business_brain_pages')
			.select('id, slug, kind, body')
			.eq('organisation_id', organisationId)
			.eq('part_id', partId)
			.in('kind', kinds)
			.filter(...filter)
			.range(0, mostDomainPagesRead - 1)
	);
	const rows = (data ?? []) as PageRow[];
	const isRetired = (row: PageRow) => row.kind === supersededPageKind;
	const live = rows.filter((row) => !isRetired(row));
	return { bodies: new Map(live.map((row) => [row.id, row.body])), retiredSlugs: rows.filter(isRetired).map((row) => row.slug) };
}
