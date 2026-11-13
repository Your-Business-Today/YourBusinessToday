import { readDomainPageFacts } from './businessBrainDomainFacts';
import type { BrainPageLink } from './brainTypes';

/** One page of the brain as the drawing reads it. */
export type DrawnPageRow = {
	id: string;
	partId: string;
	parentPageId: string | null;
	kind: string;
	slug: string;
	title: string;
	summary: string;
	facts: unknown;
};

/** One link filed between two pages. */
export type FiledPageLink = { fromPageId: string; toPageId: string };

/** Every link the drawing draws: the links filed between pages, and the things a page's facts name by their slugs. */
export function linksDrawnBetween(pages: DrawnPageRow[], filedLinks: FiledPageLink[]): BrainPageLink[] {
	const pageIdOf = slugLookupOf(pages);
	const named = pages.flatMap((page) => namedSlugsOf(page).map((slug) => ({ fromSlug: page.id, toSlug: pageIdOf(page.partId, slug) })));
	const filed = filedLinks.map((link) => ({ fromSlug: link.fromPageId, toSlug: link.toPageId }));
	return withoutRepeats([...filed, ...named].filter(isBetweenTwoPages));
}

function slugLookupOf(pages: DrawnPageRow[]): (partId: string, slug: string) => string | null {
	const pageIds = new Map(pages.map((page) => [`${page.partId}/${page.slug}`, page.id]));
	return (partId, slug) => pageIds.get(`${partId}/${slug}`) ?? null;
}

function namedSlugsOf(page: DrawnPageRow): string[] {
	const { fields, governs } = readDomainPageFacts(page.facts);
	const referred = fields.map((field) => field.ref).filter((ref) => ref !== null);
	return [...referred, ...governs];
}

function isBetweenTwoPages(link: { fromSlug: string; toSlug: string | null }): link is BrainPageLink {
	return link.toSlug !== null && link.toSlug !== link.fromSlug;
}

function withoutRepeats(links: BrainPageLink[]): BrainPageLink[] {
	const seen = new Set<string>();
	return links.filter((link) => {
		const key = `${link.fromSlug}>${link.toSlug}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}
