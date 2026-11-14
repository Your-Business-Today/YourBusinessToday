import { candidateOf, type DomainCheckHeld } from './domainCheckHeld';
import { domainCheckKind, type DomainCheckCandidate } from '$lib/data/domainCheck';
import { domainPageKinds } from '$lib/data/businessBrainDomain';
import type { DomainPage } from '$lib/data/organisationDomain';

const pagesOfNoArea: string[] = [domainPageKinds.boundedContext, domainPageKinds.contextMap];

/** Pages and areas out of place: a page outside every area, an area with no pages, and a row of how the areas relate naming an area that is gone. */
export function misfiledPages(held: DomainCheckHeld): DomainCheckCandidate[] {
	return [...pagesOutsideAreas(held), ...emptyAreas(held), ...relationshipsToGoneAreas(held)];
}

function areasOf({ pages }: DomainCheckHeld): DomainPage[] {
	return pages.filter((page) => page.kind === domainPageKinds.boundedContext);
}

function pagesOutsideAreas(held: DomainCheckHeld): DomainCheckCandidate[] {
	const areaIds = new Set(areasOf(held).map((area) => area.pageId));
	const isOutside = (page: DomainPage) => !pagesOfNoArea.includes(page.kind) && !areaIds.has(page.parentPageId ?? '');
	return held.pages.filter(isOutside).map((page) => {
		const finding = `"${page.title}" sits outside every area, so the Domain page lists it nowhere. Which area does it belong to?`;
		return candidateOf(domainCheckKind.misfiled, finding, [page]);
	});
}

function emptyAreas(held: DomainCheckHeld): DomainCheckCandidate[] {
	const isEmpty = (area: DomainPage) => !held.pages.some((page) => page.parentPageId === area.pageId);
	return areasOf(held)
		.filter(isEmpty)
		.map((area) => {
			const finding = `The area "${area.title}" holds no pages. Is it a part of the business with its own words and records, or one named after a source?`;
			return candidateOf(domainCheckKind.misfiled, finding, [area]);
		});
}

function relationshipsToGoneAreas(held: DomainCheckHeld): DomainCheckCandidate[] {
	const { pages, domain } = held;
	const contextMap = pages.filter((page) => page.kind === domainPageKinds.contextMap);
	const areaSlugs = new Set(areasOf(held).map((area) => area.slug));
	const goneSlugs = domain.areaRelationships
		.flatMap(({ fromContextSlug, toContextSlug }) => [fromContextSlug, toContextSlug])
		.filter((slug) => !areaSlugs.has(slug));
	return [...new Set(goneSlugs)].map((slug) => {
		const finding = `How the areas relate names ${slug}, an area that is no longer in the domain: the page is stale.`;
		return candidateOf(domainCheckKind.misfiled, finding, contextMap);
	});
}
