/** The organisation's own pages: what it is, the team's jobs across its products, its domain and its workflow map. */
export type OrganisationPage = 'overview' | 'task-management' | 'domain' | 'workflow-map';

export const organisationPages = {
	overview: 'overview',
	taskManagement: 'task-management',
	domain: 'domain',
	workflowMap: 'workflow-map'
} as const;

/** Where a page of the organisation lives: the overview at the organisation's own address, each other page beneath it. */
export function organisationHref(organisationId: string, page?: OrganisationPage): string {
	const overviewHref = `/organisations/${organisationId}`;
	if (page === undefined || page === organisationPages.overview) return overviewHref;
	return `${overviewHref}/${page}`;
}

/** What the Workflow map page's address can name: the station it opens with chosen. */
export const workflowMapQueryKeys = { station: 'station' } as const;

/** The organisation's Workflow map opened on one station, as a product's tab and the Domain page link to it. */
export function workflowMapStationHref(organisationId: string, stationKey: string): string {
	const workflowMapHref = organisationHref(organisationId, organisationPages.workflowMap);
	return `${workflowMapHref}?${workflowMapQueryKeys.station}=${encodeURIComponent(stationKey)}`;
}
