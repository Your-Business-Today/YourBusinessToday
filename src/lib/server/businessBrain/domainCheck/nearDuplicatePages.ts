import { comparedWordingOf } from './comparedWording';
import { candidateOf, type DomainCheckHeld } from './domainCheckHeld';
import { domainCheckKind, type DomainCheckCandidate } from '$lib/data/domainCheck';
import { domainPageKinds } from '$lib/data/businessBrainDomain';
import type { DomainPage } from '$lib/data/organisationDomain';

/** Pages whose titles or slugs differ only by number, word order or a joining word, such as "Quote" and "Quotes" or "Job sheet" and "Sheet for the job". */
export function nearDuplicatePages({ pages }: DomainCheckHeld): DomainCheckCandidate[] {
	const compared = pages.filter((page) => page.kind !== domainPageKinds.contextMap);
	const groups = [...pagesByWording(compared).values()].filter((group) => group.length > 1);
	return distinctGroups(groups).map((group) => {
		const titles = group.map((page) => `"${page.title}"`).join(' and ');
		return candidateOf(domainCheckKind.nearDuplicate, `${titles} differ only by number, word order or a joining word: one concept, or two?`, group);
	});
}

function pagesByWording(pages: DomainPage[]): Map<string, DomainPage[]> {
	const byWording = new Map<string, DomainPage[]>();
	for (const page of pages) {
		const wordings = new Set([comparedWordingOf(page.title), comparedWordingOf(page.slug)].filter((wording) => wording.length > 0));
		wordings.forEach((wording) => byWording.set(wording, [...(byWording.get(wording) ?? []), page]));
	}
	return byWording;
}

function distinctGroups(groups: DomainPage[][]): DomainPage[][] {
	const keyOf = (group: DomainPage[]) => group.map((page) => page.pageId).sort().join(':');
	const keys = groups.map(keyOf);
	return groups.filter((group, position) => keys.indexOf(keyOf(group)) === position);
}
