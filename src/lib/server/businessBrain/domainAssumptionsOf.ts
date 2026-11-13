import { domainThingKinds } from '$lib/data/businessBrainDomainRules';
import type { DomainAssumption } from '$lib/data/domainReading';
import type { DomainPage } from '$lib/data/organisationDomain';

/** Every sentence assumed on a page filed in an area, the core area first as the areas are given, each with its page and area. */
export function domainAssumptionsOf(areas: DomainPage[], pages: DomainPage[]): DomainAssumption[] {
	return areas.flatMap((area) => pages.filter((page) => page.parentPageId === area.pageId).flatMap((page) => assumptionsOfPage(page, area)));
}

function assumptionsOfPage({ pageId, slug, kind, title, facts }: DomainPage, area: DomainPage): DomainAssumption[] {
	const thingSlug = domainThingKinds.includes(kind) ? slug : null;
	const place = { areaSlug: area.slug, areaTitle: area.title };
	return facts.assumed.map((sentence) => ({ ...place, sentence, pageId, pageTitle: title, thingSlug }));
}
