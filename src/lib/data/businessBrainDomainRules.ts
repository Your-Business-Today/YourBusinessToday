import { domainPageKinds, type DomainFieldFact, type DomainPageKind, type DomainTermFact } from './businessBrainDomain';
import type { BusinessBrainSourceGiven } from './businessBrainRules';

/**
 * How much one source's filing of a domain may hold, as the Your Brain Today modeller's update_model call held
 * it, and the limits on the facts an entity carries. Facts are kept in business_brain_pages.facts (jsonb), so
 * these are the only statement of them, read by the connector and the form alike.
 */
export const domainFilingLimits = {
	mostContexts: 4,
	mostPages: 10,
	mostRetires: 10,
	mostFields: 60,
	longestFieldName: 60,
	longestFieldLabel: 200,
	longestFieldType: 60,
	longestFieldNotes: 1000,
	mostStatuses: 30,
	longestStatus: 60,
	mostGoverned: 20,
	mostTerms: 100,
	longestWord: 120,
	longestMeaning: 1000
} as const;

/** The kinds a page written by a filing may take; a bounded context is filed as a context, never as a page. */
export const domainWritableKinds: DomainPageKind[] = [
	domainPageKinds.entity,
	domainPageKinds.valueObject,
	domainPageKinds.aggregate,
	domainPageKinds.domainService,
	domainPageKinds.domainEvent,
	domainPageKinds.rule,
	domainPageKinds.glossary,
	domainPageKinds.contextMap
];

/** The kinds the business keeps and deals in: the things a rule may govern and a station may take in or produce. */
export const domainThingKinds: DomainPageKind[] = [
	domainPageKinds.entity,
	domainPageKinds.valueObject,
	domainPageKinds.aggregate,
	domainPageKinds.domainService,
	domainPageKinds.domainEvent
];

/** The kinds whose pages carry fields, statuses and an aggregate root as facts. */
export const domainKindsWithFields: DomainPageKind[] = [domainPageKinds.entity, domainPageKinds.valueObject, domainPageKinds.aggregate];

/** The kind a page takes once the modelling supersedes it: out of the domain, its history kept. */
export const supersededPageKind = 'superseded';

/** The link a superseded page keeps to the page its knowledge went into. */
export const supersededLinkKind = 'superseded_by';

/** The field type that refers to another entity, as the entity manifest names it. */
export const domainReferenceType = 'ref';

/** A bounded context as a filing gives it. */
export type DomainContextGiven = { slug: string; title: string; summary: string; body: string; isCoreDomain: boolean };

/** The facts a thing written by a filing carries, as they are kept. */
export type DomainFactsGiven = { fields: DomainFieldFact[]; statuses: string[]; aggregateRootSlug: string | null };

/** A rule's facts: the slugs of the things it governs. */
export type DomainRuleFactsGiven = { governs: string[] };

/** A glossary's facts: its words, one to a row. */
export type DomainGlossaryFactsGiven = { terms: DomainTermFact[] };

/** The facts a page of any kind written by a filing carries. */
export type DomainPageFactsGiven = DomainFactsGiven | DomainRuleFactsGiven | DomainGlossaryFactsGiven;

/** A page as a filing gives it: a slug already filed is revised, a new one filed. */
export type DomainPageWriteGiven = {
	kind: DomainPageKind;
	slug: string;
	title: string;
	summary: string;
	body: string;
	contextSlug: string;
	facts: DomainPageFactsGiven | null;
};

/** A page the modelling supersedes, and the page written in the same call that took its knowledge in. */
export type DomainRetireGiven = { slug: string; foldedIntoSlug: string };

/** What one source teaches about the domain, every value checked. */
export type DomainFilingGiven = {
	source: BusinessBrainSourceGiven;
	contexts: DomainContextGiven[];
	pages: DomainPageWriteGiven[];
	retires: DomainRetireGiven[];
};
