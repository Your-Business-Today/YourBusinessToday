import { portalProjectPath } from '$lib/portal/portalPaths';
import type { NavigationLink } from '$lib/components/site/siteNavigation';
import type { PickOrganisation } from './pickOrganisations';

const overviewLabel = 'Overview';
const projectsLabel = 'Projects';
const portalHomeLabel = 'Home';
const projectsPath = '/projects';

/**
 * The picked organisation's own pages in the side bar: its overview and its projects for the people on it,
 * and the picked project's progress for a client company reached only at the portal.
 */
export function organisationPageLinksFor(organisation: PickOrganisation, pickedProjectId: string | null): NavigationLink[] {
	const { organisationId, portalClientId } = organisation;
	if (portalClientId !== null) return portalProjectLinksFor(pickedProjectId);
	if (organisationId === null) return [];
	const overviewLink = { href: `/organisations/${organisationId}`, label: overviewLabel };
	return [overviewLink, { href: projectsPath, label: projectsLabel }];
}

/** An organisation opens on its projects; a client company at the portal on its picked project. */
export function organisationHomePathFor(organisation: PickOrganisation, pickedProjectId: string | null): string | null {
	if (organisation.portalClientId === null) return projectsPath;
	return portalProjectLinksFor(pickedProjectId)[0]?.href ?? null;
}

function portalProjectLinksFor(projectId: string | null): NavigationLink[] {
	if (projectId === null) return [];
	return [{ href: portalProjectPath(projectId), label: portalHomeLabel }];
}
