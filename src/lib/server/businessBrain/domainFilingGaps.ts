import { domainPageKinds } from '$lib/data/businessBrainDomain';
import { domainThingKinds, type DomainFilingGiven, type DomainRuleFactsGiven } from '$lib/data/businessBrainDomainRules';
import type { DomainPage } from '$lib/data/organisationDomain';

/** A filing that names what the domain does not hold: a context a page is placed in, or a thing a rule governs. */
export type DomainFilingGap = { unknownContextSlug: string } | { unknownThingSlug: string };

/** The first context or governed thing the filing names that is neither filed before nor written in it, or null. */
export function firstDomainFilingGap(filing: DomainFilingGiven, filedPages: DomainPage[]): DomainFilingGap | null {
	const unknownContextSlug = firstUnknownContext(filing, filedPages);
	if (unknownContextSlug !== null) return { unknownContextSlug };
	const unknownThingSlug = firstUnknownThing(filing, filedPages);
	return unknownThingSlug === null ? null : { unknownThingSlug };
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
