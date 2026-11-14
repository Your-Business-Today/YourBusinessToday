import type { DomainEventFacts, DomainRuleFacts } from './domainRuleFacts';

/**
 * An organisation's domain as it is filed in its Your Business Brain, in the kinds the Your Brain Today
 * domain brain modelled it in, and the rules the business runs by: bounded contexts, the building blocks
 * inside each, a glossary per context and one context map. Every one is a page of the Expertise part; a building block's parent page is its context.
 */
export const domainPageKinds = {
	boundedContext: 'bounded_context',
	contextMap: 'context_map',
	entity: 'entity',
	valueObject: 'value_object',
	aggregate: 'aggregate',
	domainService: 'domain_service',
	domainEvent: 'domain_event',
	rule: 'rule',
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
	rule: 'Rule',
	glossary: 'Glossary'
};

/** One field of an entity or value object, as its page's facts keep it; a reference names the entity's slug. */
export type DomainFieldFact = { name: string; label: string; type: string; ref: string | null; isRequired: boolean; notes: string };

/** What a word stands for beyond its meaning: the thing it names and that thing's status, whether it is a role, and its other names. */
export type DomainTermNaming = { namesThingSlug: string | null; namesStatus: string | null; isRole: boolean; otherNames: string[] };

/** One word the business uses, with what it means there and what it names, as a glossary page's facts keep it. */
export type DomainTermFact = { word: string; meaning: string } & DomainTermNaming;

/** What part an area plays: the heart of the business, needed and particular to it, or what any business has. */
export const subdomainKinds = { core: 'core', supporting: 'supporting', generic: 'generic' } as const;

export type SubdomainKind = (typeof subdomainKinds)[keyof typeof subdomainKinds];

/** Whose terms win when one area passes work to another. */
export const areaRelationshipPatterns = {
	customerSupplier: 'customer_supplier',
	conformist: 'conformist',
	sharedKernel: 'shared_kernel',
	anticorruptionLayer: 'anticorruption_layer',
	publishedLanguage: 'published_language'
} as const;

export type AreaRelationshipPattern = (typeof areaRelationshipPatterns)[keyof typeof areaRelationshipPatterns];

/** One area passing something to another, as the context map's facts keep it. */
export type AreaRelationshipFact = { fromContextSlug: string; toContextSlug: string; passes: string; pattern: AreaRelationshipPattern };

/** One status of a record's lifecycle: what being in it means, and the statuses a record in it can move to. */
export type DomainLifecycleStep = { status: string; meaning: string; movesTo: string[] };

/** What a record says of itself beyond its fields: what makes one, how it moves through its statuses, where it is kept, and a group's members. */
export type DomainRecordFacts = { identity: string | null; lifecycle: DomainLifecycleStep[]; keptIn: string | null; memberSlugs: string[] };

/** The facts a page of each kind carries beside its words: a rule names the things it governs by their slugs and sits where its kind says. */
export type DomainPageFacts = DomainRecordFacts &
	DomainEventFacts &
	DomainRuleFacts & {
		isCoreDomain: boolean;
		subdomain: SubdomainKind | null;
		fields: DomainFieldFact[];
		statuses: string[];
		aggregateRootSlug: string | null;
		governs: string[];
		terms: DomainTermFact[];
		relationships: AreaRelationshipFact[];
		assumed: string[];
	};
