import { domainPageKinds } from '$lib/data/businessBrainDomain';
import { manifestOfDomainPages } from './domainPageManifest';
import { translateEntityManifest } from '$lib/server/blueprint/translateEntityManifest';
import type { DomainBlock, DomainContextSummary, DomainPage, OrganisationDomain } from '$lib/data/organisationDomain';

/** The blocks listed beneath a context; its entities are drawn on the map instead. */
const listedKinds: string[] = [
	domainPageKinds.aggregate,
	domainPageKinds.valueObject,
	domainPageKinds.domainService,
	domainPageKinds.domainEvent,
	domainPageKinds.glossary
];

/** The domain the pages hold, or null when no bounded context has been filed yet. */
export function organisationDomainOf(pages: DomainPage[]): OrganisationDomain | null {
	const contextPages = pages.filter((page) => page.kind === domainPageKinds.boundedContext);
	if (contextPages.length === 0) return null;
	const contexts = contextPages.map((context) => contextSummary(context, pages));
	const model = translateEntityManifest(manifestOfDomainPages(contextPages, pages));
	return { model, contexts, contextMap: contextMapOf(pages) };
}

function contextSummary(context: DomainPage, pages: DomainPage[]): DomainContextSummary {
	const inside = pages.filter((page) => page.parentPageId === context.pageId && listedKinds.includes(page.kind));
	const { pageId, slug, title, summary, facts } = context;
	return { pageId, slug, title, summary, isCoreDomain: facts.isCoreDomain, blocks: inside.map(blockOf) };
}

function contextMapOf(pages: DomainPage[]): DomainBlock | null {
	const contextMap = pages.find((page) => page.kind === domainPageKinds.contextMap);
	return contextMap === undefined ? null : blockOf(contextMap);
}

function blockOf({ pageId, kind, title, summary }: DomainPage): DomainBlock {
	return { pageId, kind, title, summary };
}
