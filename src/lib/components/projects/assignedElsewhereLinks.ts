import { boardSideOfTab, type BoardSide } from '$lib/data/boardSide';
import { organisationHref, organisationPages } from '$lib/components/organisations/organisationPages';
import { boardQueryKeys, projectHref } from './projectAddresses';
import type { AssignedElsewhere } from '$lib/data/assignedElsewhere';
import type { BoardTab } from '$lib/data/boardTab';

type LinkedProject = { id: string; organisationId: string | null };

/** One tab elsewhere holding the viewer's tasks, with where to open it. */
export type AssignedElsewhereLink = { label: string; count: number; href: string };

/** Where each tab holding the viewer's other tasks opens: on this project, or the organisation's Tasks page for the team's jobs. */
export function assignedElsewhereLinks(
	project: LinkedProject,
	elsewhere: AssignedElsewhere[],
	shownSides: BoardSide[]
): AssignedElsewhereLink[] {
	return elsewhere.map(({ tab, label, count }) => ({ label, count, href: tabHref(project, tab, shownSides) }));
}

function tabHref(project: LinkedProject, tab: BoardTab, shownSides: BoardSide[]): string {
	const { id, organisationId } = project;
	const isOnThisProject = shownSides.includes(boardSideOfTab(tab));
	if (isOnThisProject || organisationId === null) return `${projectHref(id)}?${boardQueryKeys.department}=${tab}`;
	return organisationHref(organisationId, organisationPages.taskManagement);
}
