import { boardSideOfTab, type BoardSide } from '$lib/data/boardSide';
import { parseBoardTab } from '$lib/data/boardTab';
import { organisationHref, organisationPages } from '$lib/components/organisations/organisationPages';
import { boardQueryKeys } from './projectAddresses';

type OrganisedProject = { organisationId: string | null };

/** The organisation's Tasks page, when an old address asks a product for the team's jobs it no longer shows; else null. */
export function teamJobsAddressFor(project: OrganisedProject, address: URL, shownSides: BoardSide[]): string | null {
	const { organisationId } = project;
	const namedTab = parseBoardTab(address.searchParams.get(boardQueryKeys.department));
	if (namedTab === null || organisationId === null) return null;
	const namedSide = boardSideOfTab(namedTab);
	if (shownSides.includes(namedSide)) return null;
	return organisationHref(organisationId, organisationPages.taskManagement);
}
