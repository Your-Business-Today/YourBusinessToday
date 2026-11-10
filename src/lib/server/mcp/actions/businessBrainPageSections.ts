import { formatBritishDate } from '$lib/data/britishDate';
import { countOf } from '$lib/data/countOf';
import type { BusinessBrainLinkRead } from '$lib/server/businessBrain/readBusinessBrainPageLinks';
import type { BusinessBrainRevisionEntry } from '$lib/server/businessBrain/readBusinessBrainPageHistory';
import type { BusinessBrainSourceRead } from '$lib/server/businessBrain/readBusinessBrainPageWhole';

/** The page's earlier versions as its history lists them, and how many it has in all. */
export type BusinessBrainHistory = { entries: BusinessBrainRevisionEntry[]; revisionCount: number };

/** Where the words came from, for Claude to cite. */
export function sourceSection(source: BusinessBrainSourceRead | null): string[] {
	if (source === null) return ['', '## Source', 'No source was named for these words.'];
	const origin = source.origin === '' ? [] : [`- Where it can be found: ${source.origin}`];
	const summary = source.summary === '' ? [] : [`- What it is: ${source.summary}`];
	const filed = `- Filed ${formatBritishDate(source.filedAt)} (source id ${source.sourceId})`;
	return ['', '## Source', `**${source.title}**`, ...origin, ...summary, filed];
}

/** The page's facts, one to a line, or nothing when it has none. */
export function factsSection(facts: Record<string, unknown>): string[] {
	const factLines = Object.entries(facts).map(([name, value]) => `- ${name}: ${JSON.stringify(value)}`);
	if (factLines.length === 0) return [];
	return ['', '## Facts', ...factLines];
}

function linkLine(link: BusinessBrainLinkRead): string {
	const relation = link.linkKind.replaceAll('_', ' ');
	const otherPage = `**${link.title}** (page id ${link.pageId})`;
	if (link.isFromThisPage) return `- This page ${relation} ${otherPage}`;
	return `- ${otherPage} ${relation} this page`;
}

/** The page it sits under and the pages linked to and from it, or nothing when it stands alone. */
export function relatedSection(parent: { pageId: string; title: string } | null, links: BusinessBrainLinkRead[]): string[] {
	const parentLine = parent === null ? [] : [`- Part of **${parent.title}** (page id ${parent.pageId})`];
	const lines = [...parentLine, ...links.map(linkLine)];
	if (lines.length === 0) return [];
	return ['', '## Related pages', ...lines];
}

function revisionLine(entry: BusinessBrainRevisionEntry): string {
	return `- Revision ${entry.revisionId}: read as "${entry.title}" until ${formatBritishDate(entry.revisedAt)}`;
}

/** The page's earlier versions, latest first, and how to read one. */
export function historySection(history: BusinessBrainHistory): string[] {
	const { entries, revisionCount } = history;
	if (revisionCount === 0) return ['', '## History', 'This is the first version of the page; it has not been revised.'];
	const unlisted = revisionCount - entries.length;
	const cutNote = unlisted > 0 ? [`${countOf(unlisted, 'older version')} not listed.`] : [];
	const howToRead = 'Read an earlier version with read_business_brain_page and its revisionId.';
	const heading = `## History: ${countOf(revisionCount, 'earlier version')}`;
	return ['', heading, ...entries.map(revisionLine), ...cutNote, howToRead];
}
