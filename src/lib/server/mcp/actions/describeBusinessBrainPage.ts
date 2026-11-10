import { businessBrainPartNames } from '$lib/data/businessBrainRules';
import { formatBritishDate } from '$lib/data/britishDate';
import { brainOf } from './businessBrainAnswers';
import { factsSection, historySection, relatedSection, sourceSection, type BusinessBrainHistory } from './businessBrainPageSections';
import type { BusinessBrainLinkRead } from '$lib/server/businessBrain/readBusinessBrainPageLinks';
import type { BusinessBrainPageRead, BusinessBrainSourceRead } from '$lib/server/businessBrain/readBusinessBrainPageWhole';
import type { BusinessBrainRevisionRead } from '$lib/server/businessBrain/readBusinessBrainPageHistory';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** What a page is read with: the page it sits under, its links and its history. */
export type BusinessBrainPageSurroundings = {
	parent: { pageId: string; title: string } | null;
	links: BusinessBrainLinkRead[];
	history: BusinessBrainHistory;
};

export const noSuchPageToRead =
	"This organisation's brain has no page by that pageId. Find the page with read_business_brain_index or search_business_brain.";

export const noSuchRevision =
	"This page's history holds no version by that revisionId. Read the page without one to see its history listed.";

function summaryLines(summary: string): string[] {
	if (summary === '') return [];
	return ['', `> ${summary}`];
}

function citation(title: string, pageId: string, source: BusinessBrainSourceRead | null): string {
	const from = source === null ? '' : `, from "${source.title}"`;
	return `Cite it as "${title}" (page id ${pageId}${from}). Answer only what it says; where it is silent, say so.`;
}

/** The page as it now reads, with where it came from, what it relates to and its history. */
export function describeBusinessBrainPage(
	organisation: Organisation,
	page: BusinessBrainPageRead,
	surroundings: BusinessBrainPageSurroundings
): string {
	const partName = businessBrainPartNames[page.partKind];
	const placing = `${brainOf(organisation)} · ${partName} · ${page.kind} · page id ${page.pageId} · last filed ${formatBritishDate(page.updatedAt)}`;
	return [
		`# ${page.title}`,
		placing,
		...summaryLines(page.summary),
		'',
		page.body,
		...factsSection(page.facts),
		...sourceSection(page.source),
		...relatedSection(surroundings.parent, surroundings.links),
		...historySection(surroundings.history),
		'',
		citation(page.title, page.pageId, page.source)
	].join('\n');
}

/** One earlier version of a page, said plainly to be no longer how the page reads. */
export function describeBusinessBrainRevision(organisation: Organisation, page: BusinessBrainPageRead, revision: BusinessBrainRevisionRead): string {
	const until = formatBritishDate(revision.revisedAt);
	const placing = `${brainOf(organisation)} · revision ${revision.revisionId} of page id ${page.pageId} · ${revision.kind}`;
	const notCurrent = `This is how the page read until ${until}. It now reads as "${page.title}": answer from the page as it now reads unless the earlier version is what was asked for.`;
	return [
		`# ${revision.title} (earlier version)`,
		placing,
		'',
		notCurrent,
		...summaryLines(revision.summary),
		'',
		revision.body,
		...sourceSection(revision.source)
	].join('\n');
}
