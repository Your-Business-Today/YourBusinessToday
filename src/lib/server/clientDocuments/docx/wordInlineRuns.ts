import type { Token } from 'marked';
import { escapeXml } from './escapeXml';
import { markdownTokenTypes } from './markdownTokenTypes';

export type RunStyle = { isBold: boolean; isItalic: boolean };

const plainStyle: RunStyle = { isBold: false, isItalic: false };
const checkedBox = '☒ ';
const uncheckedBox = '☐ ';

export function inlineRunsXml(tokens: Token[] | undefined, style: RunStyle = plainStyle): string {
	return (tokens ?? []).map((token) => inlineTokenXml(token, style)).join('');
}

function inlineTokenXml(token: Token, style: RunStyle): string {
	if (token.type === markdownTokenTypes.strong) return inlineRunsXml(token.tokens, { ...style, isBold: true });
	if (token.type === markdownTokenTypes.emphasis) return inlineRunsXml(token.tokens, { ...style, isItalic: true });
	if (token.type === markdownTokenTypes.checkbox)
		return textRunXml(token.checked ? checkedBox : uncheckedBox, style);
	if (token.type === markdownTokenTypes.lineBreak) return '<w:r><w:br/></w:r>';
	if ('tokens' in token && token.tokens) return inlineRunsXml(token.tokens, style);
	return textRunXml('text' in token ? String(token.text) : '', style);
}

function textRunXml(text: string, style: RunStyle): string {
	const lines = text
		.split('\n')
		.map((line) => `<w:t xml:space="preserve">${escapeXml(line)}</w:t>`);
	return `<w:r>${runPropertiesXml(style)}${lines.join('<w:br/>')}</w:r>`;
}

function runPropertiesXml(style: RunStyle): string {
	const properties = `${style.isBold ? '<w:b/>' : ''}${style.isItalic ? '<w:i/>' : ''}`;
	if (properties === '') return '';
	return `<w:rPr>${properties}</w:rPr>`;
}
