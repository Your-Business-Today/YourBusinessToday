/** The organisation's own pages: what it is, the team's jobs across its products, and its products' domains. */
export type OrganisationPage = 'overview' | 'task-management' | 'domain';

export const organisationPages = { overview: 'overview', taskManagement: 'task-management', domain: 'domain' } as const;

/** Where a page of the organisation lives: the overview at the organisation's own address, each other page beneath it. */
export function organisationHref(organisationId: string, page?: OrganisationPage): string {
	const overviewHref = `/organisations/${organisationId}`;
	if (page === undefined || page === organisationPages.overview) return overviewHref;
	return `${overviewHref}/${page}`;
}
