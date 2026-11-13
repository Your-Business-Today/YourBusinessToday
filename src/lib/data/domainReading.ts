import type { DomainFieldFact, DomainPageKind, DomainRecordFacts, DomainTermFact } from './businessBrainDomain';
import type { DomainEventFacts, DomainRuleFacts } from './domainRuleFacts';
import type { MapVocabulary } from './workflowMap/phraseInDomain';

/** Where a page of the domain sits: the area of the business it belongs to, by its slug and its title. */
export type DomainAreaPlace = { areaSlug: string; areaTitle: string };

/** Something the business keeps and deals in: its fields, the statuses it moves through, what it says of itself and the group it belongs to. */
export type DomainThing = DomainAreaPlace &
	DomainRecordFacts &
	DomainEventFacts & {
		pageId: string;
		slug: string;
		kind: DomainPageKind;
		title: string;
		summary: string;
		fields: DomainFieldFact[];
		statuses: string[];
		aggregateRootSlug: string | null;
		groupSlug: string | null;
	};

/** A rule in one sentence as its title, with the slugs of the things it governs, its kind and where that kind sits. */
export type DomainRule = DomainAreaPlace & DomainRuleFacts & { pageId: string; slug: string; title: string; summary: string; governs: string[] };

/** An area's glossary page and the words it lists one to a row, none when it holds them only as prose. */
export type DomainGlossary = DomainAreaPlace & { pageId: string; terms: DomainTermFact[] };

/** One word the business uses, what it means and the area it is used in. */
export type DomainWord = DomainTermFact & { areaTitle: string; glossaryPageId: string };

/** The lists the Domain page shows, area by area, the heart of the business first. */
export type DomainLists = { things: DomainThing[]; rules: DomainRule[]; glossaries: DomainGlossary[] };

/** What the Workflow map's station panel names of the domain: the things and words its phrases are found in, and the rules. */
export type StationDomain = { vocabulary: MapVocabulary; rules: DomainRule[] };
