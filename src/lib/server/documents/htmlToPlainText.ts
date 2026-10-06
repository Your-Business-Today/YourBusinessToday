const strippedSections = /<(script|style|noscript|svg|nav|footer|header|form)[\s\S]*?<\/\1>/gi;
const htmlComments = /<!--[\s\S]*?-->/g;
const blockTagBreaks = /<\/(p|div|li|h[1-6]|tr|table|section|article|blockquote|pre)>/gi;
const lineBreakTags = /<(br|hr)\s*\/?>/gi;
const anyTag = /<[^>]+>/g;
const repeatedBlankLines = /\n{3,}/g;

const namedEntities: Record<string, string> = {
	'&amp;': '&',
	'&lt;': '<',
	'&gt;': '>',
	'&quot;': '"',
	'&#39;': "'",
	'&nbsp;': ' ',
	'&ndash;': '–',
	'&mdash;': '—'
};

export function htmlToPlainText(html: string): string {
	const text = html
		.replace(strippedSections, ' ')
		.replace(htmlComments, ' ')
		.replace(blockTagBreaks, '\n\n')
		.replace(lineBreakTags, '\n')
		.replace(anyTag, ' ');
	return decodeEntities(text)
		.split('\n')
		.map((line) => line.replace(/\s+/g, ' ').trim())
		.join('\n')
		.replace(repeatedBlankLines, '\n\n')
		.trim();
}

function decodeEntities(text: string): string {
	return text
		.replace(/&#(\d+);/g, (whole, code) => String.fromCodePoint(Number(code)))
		.replace(/&[a-z]+;|&#39;/gi, (entity) => namedEntities[entity.toLowerCase()] ?? ' ');
}
