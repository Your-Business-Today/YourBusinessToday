import type { DomainModel } from './blueprint/domainModel';
import type { DomainPageFacts, DomainPageKind } from './businessBrainDomain';

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

/** A bounded context with whether it is the core domain and the blocks the map does not draw. */
export type DomainContextSummary = {
	pageId: string;
	slug: string;
	title: string;
	summary: string;
	isCoreDomain: boolean;
	blocks: DomainBlock[];
};

/** An organisation's own domain: the map of its entities, its contexts, and the page saying how they relate. */
export type OrganisationDomain = {
	model: DomainModel;
	contexts: DomainContextSummary[];
	contextMap: DomainBlock | null;
};
