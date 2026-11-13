import type { DomainFieldFact, DomainPageKind, DomainTermFact } from './businessBrainDomain';

/** Where a page of the domain sits: the area of the business it belongs to, by its slug and its title. */
export type DomainAreaPlace = { areaSlug: string; areaTitle: string };

/** Something the business keeps and deals in, with its fields and the statuses it moves through. */
export type DomainThing = DomainAreaPlace & {
	pageId: string;
	slug: string;
	kind: DomainPageKind;
	title: string;
	summary: string;
	fields: DomainFieldFact[];
	statuses: string[];
};

/** What must always be true, in one sentence as its title, with the slugs of the things it governs. */
export type DomainRule = DomainAreaPlace & { pageId: string; slug: string; title: string; summary: string; governs: string[] };

/** An area's glossary page and the words it lists one to a row, none when it holds them only as prose. */
export type DomainGlossary = DomainAreaPlace & { pageId: string; terms: DomainTermFact[] };

/** One word the business uses, what it means and the area it is used in. */
export type DomainWord = DomainTermFact & { areaTitle: string; glossaryPageId: string };

/** The lists the Domain page shows, area by area, the heart of the business first. */
export type DomainLists = { things: DomainThing[]; rules: DomainRule[]; glossaries: DomainGlossary[] };

/** What the Workflow map's station panel names of the domain: each filed thing's title by its slug, and the rules. */
export type StationDomain = { thingTitles: Record<string, string>; rules: DomainRule[] };
