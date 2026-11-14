import { domainPageKinds, type DomainPageKind } from '$lib/data/businessBrainDomain';
import { domainThingKinds, type DomainFilingGiven, type DomainPageWriteGiven } from '$lib/data/businessBrainDomainRules';
import type { DomainContextMapFactsGiven, DomainFactsGiven, DomainGlossaryFactsGiven, DomainTermGiven } from '$lib/data/businessBrainDomainFactsGiven';
import type { DomainPage } from '$lib/data/organisationDomain';

/** A word that names a thing the domain does not hold, or a status that thing does not move through. */
export type DomainWordGap = { word: string; unknownNamedThingSlug: string } | { word: string; thingSlug: string; unknownStatus: string; statuses: string[] };

/** The statuses of each thing of the kinds the domain will hold once the filing is in: what this call writes, else what was filed before. */
export function statusesByThing({ pages }: DomainFilingGiven, filedPages: DomainPage[], kinds = domainThingKinds): Map<string, string[]> {
	const isOfKinds = (page: { kind: DomainPageKind }) => kinds.includes(page.kind);
	const filed = filedPages.filter(isOfKinds).map(({ slug, facts }): [string, string[]] => [slug, facts.statuses]);
	const written = pages.filter(isOfKinds).map((page): [string, string[]] => [page.slug, statusesWritten(page)]);
	return new Map([...filed, ...written]);
}

function statusesWritten({ facts }: DomainPageWriteGiven): string[] {
	return (facts as DomainFactsGiven | null)?.statuses ?? [];
}

/** The words the glossaries this call writes list, one to a row. */
export function wordsWritten({ pages }: DomainFilingGiven): DomainTermGiven[] {
	const glossaries = pages.filter((page) => page.kind === domainPageKinds.glossary);
	return glossaries.flatMap((glossary) => (glossary.facts as DomainGlossaryFactsGiven).terms);
}

/** The first word this call writes naming a thing or a status the domain will not hold, or null. */
export function firstUnknownNaming(filing: DomainFilingGiven, filedPages: DomainPage[]): DomainWordGap | null {
	const statuses = statusesByThing(filing, filedPages);
	for (const { word, namesThingSlug, namesStatus } of wordsWritten(filing)) {
		if (namesThingSlug === undefined) continue;
		const thingStatuses = statuses.get(namesThingSlug);
		if (thingStatuses === undefined) return { word, unknownNamedThingSlug: namesThingSlug };
		const isStatusUnknown = namesStatus !== undefined && !thingStatuses.includes(namesStatus);
		if (isStatusUnknown) return { word, thingSlug: namesThingSlug, unknownStatus: namesStatus, statuses: thingStatuses };
	}
	return null;
}

/** The first area the context map this call writes relates that is neither filed before nor written in it, or null. */
export function firstUnknownRelatedContext({ contexts, pages }: DomainFilingGiven, filedContextSlugs: Set<string>): string | null {
	const contextMap = pages.find((page) => page.kind === domainPageKinds.contextMap);
	if (contextMap === undefined) return null;
	const known = new Set([...filedContextSlugs, ...contexts.map((context) => context.slug)]);
	const { relationships } = contextMap.facts as DomainContextMapFactsGiven;
	const related = relationships.flatMap(({ fromContextSlug, toContextSlug }) => [fromContextSlug, toContextSlug]);
	return related.find((slug) => !known.has(slug)) ?? null;
}
