import { listInlineEnumeration } from './inlineEnumeration';
import { listSemicolonRun } from './semicolonList';

const codeFence = '```';
const paragraphBreak = /\n{2,}/;
const blockStart = /^(\s{4}|\t|```|#|>|[-*+]\s|\d+[.)]\s|\|)/;

/**
 * Plain prose as it was typed, with the lists hiding inside its paragraphs
 * written out as Markdown lists. Paragraphs already written as Markdown blocks
 * — headings, lists, quotes, tables, code — are left exactly as they are.
 */
export function shapeProse(text: string): string {
	if (text.includes(codeFence)) return text;
	return text
		.split(paragraphBreak)
		.map((paragraph) => (blockStart.test(paragraph) ? paragraph : shapeParagraph(paragraph)))
		.join('\n\n');
}

function shapeParagraph(paragraph: string): string {
	return listInlineEnumeration(paragraph)
		.split(paragraphBreak)
		.map(listSemicolonRun)
		.join('\n\n');
}
