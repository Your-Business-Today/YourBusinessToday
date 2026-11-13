import { domainCheckKindNames, domainCheckLimits, type DomainCheckCandidate, type DomainCheckPage } from '$lib/data/domainCheck';

/** The candidates the site found, listed to be judged in order, each with the pages to read first, and how many more wait. */
export function domainCheckCandidatesSection(candidates: DomainCheckCandidate[]): string {
	if (candidates.length === 0)
		return '   The site found no candidates. Still read the domain whole against the faults below: a healthy domain is a valid outcome, and saying so is the answer.';
	const listed = candidates.slice(0, domainCheckLimits.mostCandidatesListed);
	const lines = listed.map((candidate, index) => `   ${index + 1}. **${domainCheckKindNames[candidate.kind]}:** ${candidate.finding} ${pagesToRead(candidate.pages)}`);
	return [`   The site found ${candidates.length} candidates:`, ...lines, ...moreCandidates(candidates.length - listed.length)].join('\n');
}

function pagesToRead(pages: DomainCheckPage[]): string {
	if (pages.length === 0) return '';
	return `(read ${pages.map((page) => `${page.title}: ${page.pageId}`).join('; ')})`;
}

function moreCandidates(moreCount: number): string[] {
	if (moreCount === 0) return [];
	return [`   And ${moreCount} more, which the next check lists once these are judged.`];
}
