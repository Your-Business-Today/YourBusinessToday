import { organisationHref, organisationPages } from '$lib/components/organisations/organisationPages';
import { portalProjectPath } from '$lib/portal/portalPaths';
import type { FrameLink } from '$lib/components/frame/frameGroups';
import type { PickOrganisation } from './pickOrganisations';

const overviewLabel = 'Overview';
const projectsLabel = 'Projects';
const tasksLabel = 'Tasks';
const portalHomeLabel = 'Home';
const projectsPath = '/projects';

/**
 * The picked organisation's own pages in the side bar: its overview, then its projects and the team's tasks
 * across them for the people on it, and the picked project's progress for a client company reached only at the portal.
 */
export function organisationPageLinksFor(organisation: PickOrganisation, pickedProjectId: string | null): FrameLink[] {
	const { organisationId, portalClientId } = organisation;
	if (portalClientId !== null) return portalProjectLinksFor(pickedProjectId);
	if (organisationId === null) return [];
	return [
		{ href: organisationHref(organisationId), label: overviewLabel },
		{ href: projectsPath, label: projectsLabel, group: 'work' },
		{ href: organisationHref(organisationId, organisationPages.taskManagement), label: tasksLabel, group: 'work' }
	];
}

/** An organisation opens on its projects; a client company at the portal on its picked project. */
export function organisationHomePathFor(organisation: PickOrganisation, pickedProjectId: string | null): string | null {
	if (organisation.portalClientId === null) return projectsPath;
	return portalProjectLinksFor(pickedProjectId)[0]?.href ?? null;
}

function portalProjectLinksFor(projectId: string | null): FrameLink[] {
	if (projectId === null) return [];
	return [{ href: portalProjectPath(projectId), label: portalHomeLabel }];
}
