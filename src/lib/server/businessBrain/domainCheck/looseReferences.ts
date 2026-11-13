import { candidateOf, type DomainCheckHeld } from './domainCheckHeld';
import { domainCheckKind, type DomainCheckCandidate } from '$lib/data/domainCheck';
import type { DomainPage } from '$lib/data/organisationDomain';

/** Every slug a page's facts name: the records its fields refer to and its group's root and members, what a rule governs, guards and follows, what an event marks and the rules that react, and the things its words name. */
function slugsNamedBy({ facts }: DomainPage): string[] {
	const { fields, governs, aggregateRootSlug, memberSlugs, marksThingSlug, reactors, followsEventSlug, guardsThingSlug, terms } = facts;
	const named = [
		...fields.map((field) => field.ref),
		...governs,
		aggregateRootSlug,
		...memberSlugs,
		marksThingSlug,
		...reactors.ruleSlugs,
		followsEventSlug,
		guardsThingSlug,
		...terms.map((term) => term.namesThingSlug)
	];
	return [...new Set(named.filter((slug): slug is string => slug !== null))];
}

/** References to a page that has been retired, or that the domain does not hold at all. */
export function looseReferences({ pages, retiredSlugs }: DomainCheckHeld): DomainCheckCandidate[] {
	const liveSlugs = new Set(pages.map((page) => page.slug));
	const retired = new Set(retiredSlugs);
	return pages.flatMap((page) =>
		slugsNamedBy(page)
			.filter((slug) => !liveSlugs.has(slug))
			.map((slug) => {
				const what = retired.has(slug) ? 'a page that has been retired' : 'a page the domain does not hold';
				const finding = `"${page.title}" names ${slug}, ${what}. Point it at the page that took its knowledge in, or drop it.`;
				return candidateOf(domainCheckKind.looseReference, finding, [page]);
			})
	);
}
