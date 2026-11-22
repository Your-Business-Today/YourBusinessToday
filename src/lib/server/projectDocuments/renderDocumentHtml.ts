import { Marked, type Tokens } from 'marked';
import { escapeHtml } from '$lib/data/escapeHtml';

const invisibleCharacters = /[\u0000- ]/g;
const namedScheme = /^[a-z][a-z0-9+.-]*:/i;
const followedSchemes = new Set(['http:', 'https:', 'mailto:']);

/**
 * Whether a link or picture in a document may be followed: the web, an email address, or a place on this
 * site. Anyone on a project can write its documents, so a script address is never let through.
 */
function isFollowedAddress(address: string): boolean {
	const bare = address.replace(invisibleCharacters, '');
	const scheme = namedScheme.exec(bare);
	if (scheme === null) return true;
	return followedSchemes.has(scheme[0].toLowerCase());
}

function titleAttribute(title: string | null | undefined): string {
	if (!title) return '';
	return ` title="${escapeHtml(title)}"`;
}

const documentMarkdown = new Marked({
	renderer: {
		html: ({ text }: Tokens.HTML | Tokens.Tag) => escapeHtml(text),
		link(link: Tokens.Link) {
			const words = this.parser.parseInline(link.tokens);
			if (!isFollowedAddress(link.href)) return words;
			return `<a href="${escapeHtml(link.href)}"${titleAttribute(link.title)} rel="noopener noreferrer">${words}</a>`;
		},
		image(image: Tokens.Image) {
			if (!isFollowedAddress(image.href)) return escapeHtml(image.text);
			return `<img src="${escapeHtml(image.href)}" alt="${escapeHtml(image.text)}"${titleAttribute(image.title)}>`;
		}
	}
});

/** A written document as the page shows it: its Markdown as HTML, with any HTML of its own shown as words. */
export function renderDocumentHtml(markdown: string): string {
	return documentMarkdown.parse(markdown, { async: false });
}
