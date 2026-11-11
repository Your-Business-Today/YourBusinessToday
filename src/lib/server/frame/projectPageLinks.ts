import { blueprintViewHref, blueprintViews } from '$lib/components/blueprint/blueprintViews';
import { portalProjectPath } from '$lib/portal/portalPaths';
import type { NavigationLink } from '$lib/components/site/siteNavigation';
import type { PickOrganisation } from './pickOrganisations';

const homeLabel = 'Home';
const deployHistoryLabel = 'Deployment history';
const deployHistorySegment = 'deploys';

/** The picked project's pages, its home first: its board for the people on it, its progress at the portal. */
export function projectPageLinksFor(organisation: PickOrganisation, projectId: string): NavigationLink[] {
	if (organisation.portalClientId !== null) return [{ href: portalProjectPath(projectId), label: homeLabel }];
	const boardLink = { href: `/projects/${projectId}`, label: homeLabel };
	const blueprintLinks = blueprintViews.map(({ label, path }) => ({ href: blueprintViewHref(projectId, path), label }));
	const deployHistoryLink = { href: `${boardLink.href}/${deployHistorySegment}`, label: deployHistoryLabel };
	return [boardLink, ...blueprintLinks, deployHistoryLink];
}

/** Where an organisation opens when none of its projects opens for the person: its own page, which names them all. */
export function organisationHomePathFor(organisation: PickOrganisation): string | null {
	const { organisationId, portalClientId } = organisation;
	if (portalClientId !== null || organisationId === null) return null;
	return `/organisations/${organisationId}`;
}
