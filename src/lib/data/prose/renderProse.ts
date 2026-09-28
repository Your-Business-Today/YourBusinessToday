import { Marked, type Tokens } from 'marked';
import { escapeHtml } from '$lib/data/escapeHtml';
import { shapeProse } from './shapeProse';

const safeLinkProtocol = /^(https?:|mailto:|\/|#)/i;

const proseMarked = new Marked({
	gfm: true,
	breaks: true,
	renderer: {
		html: (token: Tokens.HTML | Tokens.Tag) => escapeHtml(token.text),
		image: (token: Tokens.Image) => escapeHtml(token.text),
		link(token: Tokens.Link) {
			const label = this.parser.parseInline(token.tokens);
			if (!safeLinkProtocol.test(token.href)) return label;
			const href = escapeHtml(token.href);
			return `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`;
		}
	}
});

/**
 * Text people and their Claudes write — goal measures, task details, messages —
 * as safe HTML: Markdown rendered, raw HTML shown as text, only web and mail
 * links kept, and inline lists written out as lists.
 */
export function renderProse(text: string): string {
	return proseMarked.parse(shapeProse(text), { async: false });
}
