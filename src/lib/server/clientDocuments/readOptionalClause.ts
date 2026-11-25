const markdownByPath: Record<string, string> = import.meta.glob('./optionalClauses/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
});

export function readOptionalClause(slug: string): string | undefined {
	return markdownByPath[`./optionalClauses/${slug}.md`]?.trim();
}
