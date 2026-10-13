export const blueprintViews = [
	{ key: 'domain', label: 'Domain', path: 'domain' },
	{ key: 'site-map', label: 'Site map', path: 'site-map' }
] as const;

export type BlueprintViewKey = (typeof blueprintViews)[number]['key'];

const shortCommitLength = 7;

export function blueprintViewHref(projectId: string, path: string): string {
	return `/projects/${projectId}/${path}`;
}

/** A commit as GitHub shows it in short; a branch name stays whole. */
export function shortCommit(ref: string): string {
	const isCommitSha = /^[0-9a-f]{40}$/.test(ref);
	return isCommitSha ? ref.slice(0, shortCommitLength) : ref;
}

export const blueprintQueryKeys = { screen: 'screen', entity: 'entity', audience: 'audience', entry: 'entry' } as const;

/** Who the site map is drawn for: a person at the screens, or a Claude at the connector's tools, skills and agents. */
export const siteMapAudiences = { person: 'person', claude: 'claude' } as const;

export type SiteMapAudience = (typeof siteMapAudiences)[keyof typeof siteMapAudiences];

export function siteMapScreenHref(projectId: string, route: string): string {
	return `/projects/${projectId}/site-map?${blueprintQueryKeys.screen}=${encodeURIComponent(route)}`;
}

export function domainEntityHref(projectId: string, entityName: string): string {
	return `/projects/${projectId}/domain?${blueprintQueryKeys.entity}=${encodeURIComponent(entityName)}`;
}

/** The value a link put in the address for a view to open on, such as the screen or the entity. */
export function linkedValueOf(address: URL, key: string): string | null {
	return address.searchParams.get(key);
}

export function mcpEntryHref(projectId: string, entryName: string): string {
	const audience = `${blueprintQueryKeys.audience}=${siteMapAudiences.claude}`;
	return `/projects/${projectId}/site-map?${audience}&${blueprintQueryKeys.entry}=${encodeURIComponent(entryName)}`;
}

export function siteMapAudienceHref(projectId: string, audience: SiteMapAudience): string {
	return `/projects/${projectId}/site-map?${blueprintQueryKeys.audience}=${audience}`;
}

export function siteMapAudienceOf(address: URL): SiteMapAudience {
	const isForClaude = linkedValueOf(address, blueprintQueryKeys.audience) === siteMapAudiences.claude;
	return isForClaude ? siteMapAudiences.claude : siteMapAudiences.person;
}
