import type { FramePicks } from './framePicks';
import type { NavigationLink } from '$lib/components/site/siteNavigation';

/** The project a page is open on: its switcher ends the top bar's trail. */
export type OpenProject = { id: string; name: string; organisationId: string | null };

/** Where a page is, as the top bar says it: the crumbs that lead to it, then the page's own heading. */
export type FrameTrail = { crumbs: NavigationLink[]; heading: string | null };

const fallbackHeading = 'Your Business Today';

/**
 * A page of the picked organisation is led to by the organisation. A project's page is led to by its section
 * as well, and has no heading: the project's switcher stands there.
 */
export function frameTrailTo(
	section: NavigationLink | undefined,
	picks: FramePicks | null,
	openProject: OpenProject | null
): FrameTrail {
	if (section === undefined) return { crumbs: [], heading: fallbackHeading };
	const organisationCrumbs = organisationCrumbsFor(section, picks, openProject);
	if (openProject === null) return { crumbs: organisationCrumbs, heading: section.label };
	return { crumbs: [...organisationCrumbs, section], heading: null };
}

function organisationCrumbsFor(
	section: NavigationLink,
	picks: FramePicks | null,
	openProject: OpenProject | null
): NavigationLink[] {
	if (picks === null || !isUnderPickedOrganisation(section, picks, openProject)) return [];
	const { organisations, organisationLinks, pickedOrganisationId } = picks;
	const organisation = organisations.find(({ id }) => id === pickedOrganisationId);
	const [firstPage] = organisationLinks;
	if (organisation === undefined || firstPage === undefined) return [];
	return [{ href: firstPage.href, label: organisation.name }];
}

function isUnderPickedOrganisation(section: NavigationLink, picks: FramePicks, openProject: OpenProject | null): boolean {
	const organisationPages = [...picks.organisationLinks, ...picks.moduleLinks];
	const isOrganisationSection = organisationPages.some(({ href }) => href === section.href);
	const isProjectElsewhere = openProject !== null && openProject.organisationId !== picks.pickedOrganisationId;
	return isOrganisationSection && !isProjectElsewhere;
}
