const shortCommitLength = 7;

/** A commit as GitHub shows it in short; a branch name stays whole. */
export function shortCommit(ref: string): string {
	const isCommitSha = /^[0-9a-f]{40}$/.test(ref);
	return isCommitSha ? ref.slice(0, shortCommitLength) : ref;
}

export const blueprintQueryKeys = { screen: 'screen', entity: 'entity' } as const;

export function siteMapScreenHref(projectId: string, route: string): string {
	return `/projects/${projectId}/site-map?${blueprintQueryKeys.screen}=${encodeURIComponent(route)}`;
}

/** The value a link put in the address for a view to open on, such as the screen or the entity. */
export function linkedValueOf(address: URL, key: string): string | null {
	return address.searchParams.get(key);
}
