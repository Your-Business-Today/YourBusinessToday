import { domainPageKinds } from '$lib/data/businessBrainDomain';
import { domainThingKinds, type DomainFilingGiven } from '$lib/data/businessBrainDomainRules';
import type { DomainRuleFactsGiven } from '$lib/data/businessBrainDomainFactsGiven';
import { firstUnknownNaming, firstUnknownRelatedContext, type DomainWordGap } from './domainWordGaps';
import type { DomainPage } from '$lib/data/organisationDomain';

/** A filing that names what the domain does not hold: a context a page is placed in or the map relates, a thing a rule governs, or what a word names. */
export type DomainFilingGap = { unknownContextSlug: string } | { unknownThingSlug: string } | { unknownRelatedContextSlug: string } | DomainWordGap;

/** The first context, governed thing, related area or named thing or status the filing names that the domain will not hold, or null. */
export function firstDomainFilingGap(filing: DomainFilingGiven, filedPages: DomainPage[]): DomainFilingGap | null {
	const unknownContextSlug = firstUnknownContext(filing, filedPages);
	if (unknownContextSlug !== null) return { unknownContextSlug };
	const unknownThingSlug = firstUnknownThing(filing, filedPages);
	if (unknownThingSlug !== null) return { unknownThingSlug };
	const filedContextSlugs = new Set(contextPagesOf(filedPages).map((page) => page.slug));
	const unknownRelatedContextSlug = firstUnknownRelatedContext(filing, filedContextSlugs);
	if (unknownRelatedContextSlug !== null) return { unknownRelatedContextSlug };
	return firstUnknownNaming(filing, filedPages);
}

export function contextPagesOf(pages: DomainPage[]): DomainPage[] {
	return pages.filter((page) => page.kind === domainPageKinds.boundedContext);
}

function firstUnknownContext({ contexts, pages }: DomainFilingGiven, filedPages: DomainPage[]): string | null {
	const known = new Set([...contexts.map((context) => context.slug), ...contextPagesOf(filedPages).map((page) => page.slug)]);
	const placed = pages.filter((page) => page.kind !== domainPageKinds.contextMap);
	return placed.find((page) => !known.has(page.contextSlug))?.contextSlug ?? null;
}

function firstUnknownThing({ pages }: DomainFilingGiven, filedPages: DomainPage[]): string | null {
	const things = [...filedPages, ...pages].filter((page) => domainThingKinds.includes(page.kind));
	const known = new Set(things.map((thing) => thing.slug));
	const rules = pages.filter((page) => page.kind === domainPageKinds.rule);
	const governed = rules.flatMap((rule) => (rule.facts as DomainRuleFactsGiven).governs);
	return governed.find((slug) => !known.has(slug)) ?? null;
}
