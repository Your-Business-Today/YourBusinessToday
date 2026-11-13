import { domainPageKinds } from '$lib/data/businessBrainDomain';
import { domainThingKinds } from '$lib/data/businessBrainDomainRules';
import { groupSlugOf } from '$lib/data/domainGroups';
import type { DomainAreaPlace, DomainGlossary, DomainLists, DomainRule, DomainThing } from '$lib/data/domainReading';
import type { DomainPage } from '$lib/data/organisationDomain';

/** The things, rules and glossaries filed under each context, area by area with the core domain first. */
export function domainListsOf(contextPages: DomainPage[], pages: DomainPage[]): DomainLists {
	const areas = coreFirst(contextPages);
	const inArea = (context: DomainPage) => pages.filter((page) => page.parentPageId === context.pageId);
	return {
		things: areas.flatMap((context) => inArea(context).filter(isThing).map((page) => thingOf(page, placeOf(context), pages))),
		rules: areas.flatMap((context) => inArea(context).filter(isRule).map((page) => ruleOf(page, placeOf(context)))),
		glossaries: areas.flatMap((context) => inArea(context).filter(isGlossary).map((page) => glossaryOf(page, placeOf(context))))
	};
}

function coreFirst(contextPages: DomainPage[]): DomainPage[] {
	const core = contextPages.filter(({ facts }) => facts.isCoreDomain);
	const others = contextPages.filter(({ facts }) => !facts.isCoreDomain);
	return [...core, ...others];
}

function placeOf({ slug, title }: DomainPage): DomainAreaPlace {
	return { areaSlug: slug, areaTitle: title };
}

function isThing(page: DomainPage): boolean {
	return domainThingKinds.includes(page.kind);
}

function isRule(page: DomainPage): boolean {
	return page.kind === domainPageKinds.rule;
}

function isGlossary(page: DomainPage): boolean {
	return page.kind === domainPageKinds.glossary;
}

function thingOf({ pageId, slug, kind, title, summary, facts }: DomainPage, place: DomainAreaPlace, pages: DomainPage[]): DomainThing {
	const { fields, statuses, aggregateRootSlug, identity, lifecycle, keptIn, memberSlugs } = facts;
	const recordFacts = { identity, lifecycle, keptIn, memberSlugs, aggregateRootSlug };
	return { ...place, ...recordFacts, pageId, slug, kind, title, summary, fields, statuses, groupSlug: groupSlugOf(pages, slug) };
}

function ruleOf({ pageId, slug, title, summary, facts }: DomainPage, place: DomainAreaPlace): DomainRule {
	return { ...place, pageId, slug, title, summary, governs: facts.governs };
}

function glossaryOf({ pageId, facts }: DomainPage, place: DomainAreaPlace): DomainGlossary {
	return { ...place, pageId, terms: facts.terms };
}
