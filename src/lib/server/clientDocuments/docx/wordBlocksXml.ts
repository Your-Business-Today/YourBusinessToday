import type { Token, Tokens } from 'marked';
import { inlineRunsXml } from './wordInlineRuns';
import { markdownTokenTypes } from './markdownTokenTypes';
import { tableXml } from './wordTableXml';

const bulletPrefix = '• ';

export function blocksXml(tokens: Token[]): string {
	return tokens.map(blockXml).join('');
}

function blockXml(token: Token): string {
	if (token.type === markdownTokenTypes.heading)
		return paragraphXml(inlineRunsXml(token.tokens), `Heading${token.depth}`);
	if (token.type === markdownTokenTypes.paragraph) return paragraphXml(inlineRunsXml(token.tokens));
	if (token.type === markdownTokenTypes.list) return listXml(token as Tokens.List);
	if (token.type === markdownTokenTypes.table) return tableXml(token as Tokens.Table);
	if (token.type === markdownTokenTypes.blockquote) return quoteXml(token as Tokens.Blockquote);
	if (token.type === markdownTokenTypes.rule) return paragraphXml('', 'Rule');
	return '';
}

function paragraphXml(runs: string, styleId?: string): string {
	const properties = styleId ? `<w:pPr><w:pStyle w:val="${styleId}"/></w:pPr>` : '';
	return `<w:p>${properties}${runs}</w:p>`;
}

function listXml(list: Tokens.List): string {
	const firstNumber = Number(list.start) || 1;
	return list.items
		.map((item, index) => listItemXml(item, listItemPrefix(list, item, firstNumber + index)))
		.join('');
}

function listItemPrefix(list: Tokens.List, item: Tokens.ListItem, itemNumber: number): string {
	if (item.task) return '';
	if (list.ordered) return `${itemNumber}. `;
	return bulletPrefix;
}

function listItemXml(item: Tokens.ListItem, prefix: string): string {
	const prefixRun = prefix === '' ? '' : `<w:r><w:t xml:space="preserve">${prefix}</w:t></w:r>`;
	return paragraphXml(`${prefixRun}${inlineRunsXml(item.tokens)}`, 'ListParagraph');
}

function quoteXml(quote: Tokens.Blockquote): string {
	return quote.tokens
		.filter((token) => token.type !== 'space')
		.map((token) => paragraphXml(inlineRunsXml([token]), 'Quote'))
		.join('');
}
