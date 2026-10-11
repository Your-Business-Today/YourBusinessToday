import { lineageOf, type OrganisationPlace } from './organisationAccess';

/** The projects page shows every project, the ones under no organisation, or the ones under one organisation and its businesses. */
export type OrganisationFilter = string;

export const everyOrganisationFilter: OrganisationFilter = 'all';
export const noOrganisationFilter: OrganisationFilter = 'none';

export function matchesOrganisationFilter(
	projectOrganisationId: string | null,
	filter: OrganisationFilter,
	organisations: OrganisationPlace[]
): boolean {
	if (filter === everyOrganisationFilter) return true;
	if (filter === noOrganisationFilter) return projectOrganisationId === null;
	if (projectOrganisationId === null) return false;
	return lineageOf(organisations, projectOrganisationId).includes(filter);
}
