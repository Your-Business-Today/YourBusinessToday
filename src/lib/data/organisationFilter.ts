import type { FramePicks } from '$lib/components/frame/framePicks';

/** The projects page shows every project, the personal ones under no organisation, or the ones under one organisation. */
export type OrganisationFilter = string;

export const everyOrganisationFilter: OrganisationFilter = 'all';
export const noOrganisationFilter: OrganisationFilter = 'none';

export function matchesOrganisationFilter(projectOrganisationId: string | null, filter: OrganisationFilter): boolean {
	if (filter === everyOrganisationFilter) return true;
	if (filter === noOrganisationFilter) return projectOrganisationId === null;
	return projectOrganisationId === filter;
}

/** The projects page shows the organisation picked in the side bar, or every project when there is none to pick. */
export function pickedOrganisationFilter(framePicks: FramePicks | null): OrganisationFilter {
	return framePicks?.pickedOrganisationId ?? everyOrganisationFilter;
}
