import { boardSideLabels } from '$lib/data/boardSide';
import { deepestLinkAt } from '$lib/components/frame/deepestLink';

/** The organisation's own tabs: what it is, the team's jobs across its products, and its products' domains. */
export type OrganisationPage = 'overview' | 'task-management' | 'domain';

export const organisationPages = { overview: 'overview', taskManagement: 'task-management', domain: 'domain' } as const;

export type OrganisationPageLink = { key: OrganisationPage; label: string; href: string };

const overviewLabel = 'Overview';
const domainLabel = 'Domain';

export function organisationHref(organisationId: string, page?: OrganisationPage): string {
	const overviewHref = `/organisations/${organisationId}`;
	if (page === undefined || page === organisationPages.overview) return overviewHref;
	return `${overviewHref}/${page}`;
}

/**
 * An organisation's tabs: its Overview, Task Management across all its products, and their Domain. It has no
 * Development tab, because development belongs to each product.
 */
export function organisationPageLinks(organisationId: string): OrganisationPageLink[] {
	return [
		{ key: organisationPages.overview, label: overviewLabel, href: organisationHref(organisationId) },
		{
			key: organisationPages.taskManagement,
			label: boardSideLabels.internal,
			href: organisationHref(organisationId, organisationPages.taskManagement)
		},
		{ key: organisationPages.domain, label: domainLabel, href: organisationHref(organisationId, organisationPages.domain) }
	];
}

/** The tab a page of the organisation sits under, Overview when it is none of the others. */
export function currentOrganisationPage(organisationId: string, pathname: string): OrganisationPage {
	const links = organisationPageLinks(organisationId);
	const holdingLink = links.find(({ href }) => href === deepestLinkAt(links, pathname)?.href);
	return holdingLink?.key ?? organisationPages.overview;
}
