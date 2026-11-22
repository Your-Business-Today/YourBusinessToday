import type { ExcerptPart } from './libraryMatch';

const matchStart = '«';
const matchEnd = '»';
const markedWordsPattern = new RegExp(`${matchStart}([^${matchStart}${matchEnd}]*)${matchEnd}`);
const markdownMarksPattern = /[#*_`>]+/g;
const runOfSpacesPattern = /\s+/g;

/**
 * The excerpt search_project_library (migration 0269) gives, as plain words: the Markdown marks of a written
 * document taken out, its lines run together, and the words the search matched told apart from the rest.
 */
export function excerptPartsOf(excerpt: string): ExcerptPart[] {
	const plainWords = excerpt.replace(markdownMarksPattern, ' ').replace(runOfSpacesPattern, ' ').trim();
	const pieces = plainWords.split(markedWordsPattern);
	return pieces.map((words, index) => ({ words, isMatch: index % 2 === 1 })).filter(({ words }) => words !== '');
}

/** The excerpt as Markdown, the matched words in bold, for a Claude to read. */
export function excerptAsMarkdown(parts: ExcerptPart[]): string {
	return parts.map(({ words, isMatch }) => (isMatch ? `**${words}**` : words)).join('');
}
