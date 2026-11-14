import type { DomainCheckCandidate, DomainCheckKind, DomainCheckPage } from '$lib/data/domainCheck';
import type { DomainHeld } from '../domainGaps/domainHeld';
import type { DomainPage } from '$lib/data/organisationDomain';

/** What the domain check reads: the domain as it is tested for completeness, every page of it, each page's body by its id, and the slugs of the pages retired from it. */
export type DomainCheckHeld = DomainHeld & { pages: DomainPage[]; bodies: Map<string, string>; retiredSlugs: string[] };

/** A candidate of its kind, naming the pages to read whole before judging it. */
export function candidateOf(kind: DomainCheckKind, finding: string, pages: DomainCheckPage[]): DomainCheckCandidate {
	return { kind, finding, pages: pages.map(({ pageId, title }) => ({ pageId, title })) };
}

/** The page of the domain with this id, as a candidate names it, or none when the domain holds no such page. */
export function pagesWithId({ pages }: DomainCheckHeld, pageId: string): DomainPage[] {
	return pages.filter((page) => page.pageId === pageId);
}
