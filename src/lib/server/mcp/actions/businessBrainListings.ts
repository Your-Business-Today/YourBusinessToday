import { businessBrainPartKinds, businessBrainPartNames, type BusinessBrainPartKind } from '$lib/data/businessBrainRules';
import { formatBritishDate } from '$lib/data/britishDate';
import { countOf } from '$lib/data/countOf';
import type { BusinessBrainIndex, BusinessBrainIndexEntry } from '$lib/server/businessBrain/readBusinessBrainIndex';
import type { BusinessBrainPageMatch } from '$lib/server/businessBrain/searchBusinessBrain';
import type { BusinessBrainDoor } from './businessBrainDoor';

export const searchNotReadyYet =
	"Searching Your Business Brain starts once this release's database change has run. Until then, read_business_brain_index lists every page by title.";

function entryLine(entry: BusinessBrainIndexEntry): string {
	const summary = entry.summary === '' ? '' : ` — ${entry.summary}`;
	return `- **${entry.title}** (${entry.kind}, page id ${entry.pageId}, last filed ${formatBritishDate(entry.updatedAt)})${summary}`;
}

function partSection(kind: BusinessBrainPartKind, entries: BusinessBrainIndexEntry[]): string[] {
	const pagesOfPart = entries.filter((entry) => entry.partKind === kind);
	if (pagesOfPart.length === 0) return [];
	return ['', `## ${businessBrainPartNames[kind]}`, ...pagesOfPart.map(entryLine)];
}

/** The index as Claude reads it: every page listed under its part, and a word on any not listed. */
export function describeBusinessBrainIndex(door: BusinessBrainDoor, index: BusinessBrainIndex): string {
	const { entries, pageCount } = index;
	if (pageCount === 0) return `${door.brainName} holds no pages here yet. Nothing has been filed into it.`;
	const sections = businessBrainPartKinds.flatMap((kind) => partSection(kind, entries));
	const unlisted = pageCount - entries.length;
	const cutNote = unlisted > 0 ? ['', `${countOf(unlisted, 'more page')} not listed: give a part, or search for what you need.`] : [];
	const heading = `# ${door.brainName}: ${countOf(pageCount, 'page')}`;
	return [heading, ...sections, ...cutNote, '', `Read a page with ${door.readPageAction} and its page id.`].join('\n');
}

function matchLines(match: BusinessBrainPageMatch, position: number): string[] {
	const partName = businessBrainPartNames[match.partKind];
	const heading = `${position + 1}. **${match.title}** — ${partName}, ${match.kind}, page id ${match.pageId}`;
	if (match.excerpt === '') return [heading];
	return [heading, `   > ${match.excerpt}`];
}

/** The pages a search found, best first, or a plain word that the brain holds nothing on it. */
export function describeBusinessBrainSearch(door: BusinessBrainDoor, searchText: string, matches: BusinessBrainPageMatch[]): string {
	if (matches.length === 0) {
		return `${door.brainName} holds no page that matches "${searchText}". Say so rather than answering from elsewhere, or try other words.`;
	}
	const heading = `${countOf(matches.length, 'page')} in ${door.brainName} matching "${searchText}", best first:`;
	const footer = `These are excerpts: read each page you answer from with ${door.readPageAction} before citing it.`;
	return [heading, '', ...matches.flatMap(matchLines), '', footer].join('\n');
}
