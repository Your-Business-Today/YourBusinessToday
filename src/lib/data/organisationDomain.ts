import type { DomainAssumption, DomainLists } from './domainReading';
import type { DomainModel } from './blueprint/domainModel';
import type { AreaRelationshipFact, DomainPageFacts, DomainPageKind, SubdomainKind } from './businessBrainDomain';

/** One page of the domain filed in an organisation's brain, as the Domain tab reads it. */
export type DomainPage = {
	pageId: string;
	parentPageId: string | null;
	kind: DomainPageKind;
	slug: string;
	title: string;
	summary: string;
	facts: DomainPageFacts;
};

/** A building block listed beneath its context: its page, so the reader can open it in the brain. */
export type DomainBlock = { pageId: string; kind: DomainPageKind; title: string; summary: string };

/** A bounded context with whether it is the core domain, the part it plays and the blocks the map does not draw. */
export type DomainContextSummary = {
	pageId: string;
	slug: string;
	title: string;
	summary: string;
	isCoreDomain: boolean;
	subdomain: SubdomainKind | null;
	blocks: DomainBlock[];
};

/** One area passing something to another, with each area's title. */
export type DomainAreaRelationship = AreaRelationshipFact & { fromTitle: string; toTitle: string };

/** An organisation's own domain: the map of its entities, its contexts, the page saying how they relate and its rows, its things, rules and glossaries, and what was assumed. */
export type OrganisationDomain = DomainLists & {
	model: DomainModel;
	contexts: DomainContextSummary[];
	contextMap: DomainBlock | null;
	areaRelationships: DomainAreaRelationship[];
	assumptions: DomainAssumption[];
};
