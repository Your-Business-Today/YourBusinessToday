/**
 * An organisation's domain as it is filed in its Your Business Brain, in the kinds the Your Brain Today
 * domain brain modelled it in: bounded contexts, the building blocks inside each, a glossary per context
 * and one context map. Every one is a page of the Expertise part; a building block's parent page is its context.
 */
export const domainPageKinds = {
	boundedContext: 'bounded_context',
	contextMap: 'context_map',
	entity: 'entity',
	valueObject: 'value_object',
	aggregate: 'aggregate',
	domainService: 'domain_service',
	domainEvent: 'domain_event',
	glossary: 'glossary'
} as const;

export type DomainPageKind = (typeof domainPageKinds)[keyof typeof domainPageKinds];

export const everyDomainPageKind: DomainPageKind[] = Object.values(domainPageKinds);

/** The part of the brain a domain is filed in. */
export const domainBrainPart = 'expertise';

/** The one context map's permanent slug. */
export const contextMapSlug = 'context-map';

/** What each building block is called when it is listed beneath its context. */
export const domainBlockNames: Record<DomainPageKind, string> = {
	bounded_context: 'Bounded context',
	context_map: 'Context map',
	entity: 'Entity',
	value_object: 'Value object',
	aggregate: 'Aggregate',
	domain_service: 'Domain service',
	domain_event: 'Domain event',
	glossary: 'Glossary'
};

/** One field of an entity or value object, as its page's facts keep it; a reference names the entity's slug. */
export type DomainFieldFact = { name: string; label: string; type: string; ref: string | null; isRequired: boolean; notes: string };

/** The facts a page of each kind carries beside its words. */
export type DomainPageFacts = {
	isCoreDomain: boolean;
	fields: DomainFieldFact[];
	statuses: string[];
	aggregateRootSlug: string | null;
};
