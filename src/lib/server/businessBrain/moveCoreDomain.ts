import { domainPageKinds } from '$lib/data/businessBrainDomain';
import { keepDomainPage, type DomainPageKept, type DomainPagePlace } from './keepDomainPage';
import { readDomainPageStanding, valuesOfStanding } from './domainPageStanding';
import type { DomainContextGiven } from '$lib/data/businessBrainDomainRules';
import type { DomainPage } from '$lib/data/organisationDomain';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Exactly one context is the core domain. When a filing marks one, every other context marked before takes a
 * revision that unmarks it and leaves its part unsaid until it is filed again, its earlier version kept in its history.
 */
export async function moveCoreDomainTo(
	supabase: SupabaseClient,
	place: DomainPagePlace,
	contexts: DomainContextGiven[],
	filedPages: DomainPage[]
): Promise<DomainPageKept[]> {
	const newCore = contexts.find((context) => context.isCoreDomain);
	if (newCore === undefined) return [];
	const formerCores = filedPages.filter((page) => isCoreElsewhere(page, newCore.slug));
	const unmarked: DomainPageKept[] = [];
	for (const formerCore of formerCores) {
		const standing = await readDomainPageStanding(supabase, place, formerCore.slug);
		if (standing === null) continue;
		const values = { ...valuesOfStanding(standing), facts: { ...standing.facts, isCoreDomain: false, subdomain: null } };
		unmarked.push(await keepDomainPage(supabase, place, values));
	}
	return unmarked;
}

function isCoreElsewhere({ kind, slug, facts }: DomainPage, coreSlug: string): boolean {
	const isContext = kind === domainPageKinds.boundedContext;
	return isContext && facts.isCoreDomain && slug !== coreSlug;
}
