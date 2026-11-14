import { domainPageKinds } from '$lib/data/businessBrainDomain';
import { coreFirst, domainListsOf } from './domainListsOf';
import { domainAssumptionsOf } from './domainAssumptionsOf';
import { manifestOfDomainPages } from './domainPageManifest';
import { translateEntityManifest } from '$lib/server/blueprint/translateEntityManifest';
import type { DomainAreaRelationship, DomainBlock, DomainContextSummary, DomainPage, OrganisationDomain } from '$lib/data/organisationDomain';

/** The blocks listed beneath a context; its entities are drawn on the map instead. */
const listedKinds: string[] = [
	domainPageKinds.aggregate,
	domainPageKinds.valueObject,
	domainPageKinds.domainService,
	domainPageKinds.domainEvent,
	domainPageKinds.rule,
	domainPageKinds.glossary
];

/** The domain the pages hold, or null when no bounded context has been filed yet. */
export function organisationDomainOf(pages: DomainPage[]): OrganisationDomain | null {
	const contextPages = pages.filter((page) => page.kind === domainPageKinds.boundedContext);
	if (contextPages.length === 0) return null;
	const contexts = contextPages.map((context) => contextSummary(context, pages));
	const model = translateEntityManifest(manifestOfDomainPages(contextPages, pages));
	const contextMapPage = pages.find((page) => page.kind === domainPageKinds.contextMap);
	const contextMap = contextMapPage === undefined ? null : blockOf(contextMapPage);
	const areaRelationships = areaRelationshipsOf(contextMapPage, contextPages);
	const assumptions = domainAssumptionsOf(coreFirst(contextPages), pages);
	return { model, contexts, contextMap, areaRelationships, assumptions, ...domainListsOf(contextPages, pages) };
}

function contextSummary(context: DomainPage, pages: DomainPage[]): DomainContextSummary {
	const inside = pages.filter((page) => page.parentPageId === context.pageId && listedKinds.includes(page.kind));
	const { pageId, slug, title, summary, facts } = context;
	const { isCoreDomain, subdomain } = facts;
	return { pageId, slug, title, summary, isCoreDomain, subdomain, blocks: inside.map(blockOf) };
}

function areaRelationshipsOf(contextMapPage: DomainPage | undefined, contextPages: DomainPage[]): DomainAreaRelationship[] {
	if (contextMapPage === undefined) return [];
	const titles = new Map(contextPages.map((context) => [context.slug, context.title]));
	const titleOf = (slug: string) => titles.get(slug) ?? slug;
	const { relationships } = contextMapPage.facts;
	return relationships.map((row) => ({ ...row, fromTitle: titleOf(row.fromContextSlug), toTitle: titleOf(row.toContextSlug) }));
}

function blockOf({ pageId, kind, title, summary }: DomainPage): DomainBlock {
	return { pageId, kind, title, summary };
}
