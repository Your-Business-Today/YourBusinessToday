import type { WebSearchSource } from '$lib/server/anthropic/webSearchResults';

export type FoundRole = { title: string; organisation: string; sourceUrl: string };
export type FoundLink = { label: string; url: string };

export type PersonFindings = {
	personId: string;
	personName: string;
	summary: string;
	roles: FoundRole[];
	links: FoundLink[];
	sources: WebSearchSource[];
};

/**
 * Only a page the search actually read can be cited, so a link Claude
 * misremembered never reaches the record.
 */
export function parsePersonFindings(
	toolInput: Record<string, unknown>,
	sources: WebSearchSource[],
	person: { id: string; name: string }
): PersonFindings {
	const readUrls = new Set(sources.map((source) => source.url));
	return {
		personId: person.id,
		personName: person.name,
		summary: String(toolInput.summary ?? '').trim(),
		roles: parseRoles(toolInput.roles, readUrls),
		links: parseLinks(toolInput.links, readUrls),
		sources
	};
}

function parseRoles(value: unknown, readUrls: Set<string>): FoundRole[] {
	if (!Array.isArray(value)) return [];
	return value
		.map((role) => ({
			title: String(role?.title ?? '').trim(),
			organisation: String(role?.organisation ?? '').trim(),
			sourceUrl: readUrls.has(String(role?.source_url)) ? String(role.source_url) : ''
		}))
		.filter((role) => role.title !== '');
}

function parseLinks(value: unknown, readUrls: Set<string>): FoundLink[] {
	if (!Array.isArray(value)) return [];
	return value
		.map((link) => ({ label: String(link?.label ?? '').trim(), url: String(link?.url ?? '').trim() }))
		.filter((link) => link.label !== '' && readUrls.has(link.url));
}
