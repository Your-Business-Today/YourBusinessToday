import { boardTabLabels, type BoardTab } from '$lib/data/boardTab';
import { tabsOnBoardSide } from '$lib/data/boardSide';
import { developmentViews } from '$lib/data/developmentView';
import { boardQueryKeys, projectHref, projectSegments } from './projectAddresses';

/** A page inside Development: one backlog per kind of work, the scrum board, what is staged and deployed, and the site map. */
export type DevelopmentPage = BoardTab | 'board' | 'staged' | 'deploys' | 'site-map';

export const developmentPages = {
	board: developmentViews.board,
	staged: projectSegments.staged,
	deploys: projectSegments.deploys,
	siteMap: projectSegments.siteMap
} as const;

export type DevelopmentPageLink = { key: DevelopmentPage; label: string; href: string };

const deliveryPages = [
	{ key: developmentPages.staged, label: 'Staged' },
	{ key: developmentPages.deploys, label: 'Deployments' },
	{ key: developmentPages.siteMap, label: 'Site map' }
];

/**
 * Development's own tabs, one row beneath the product's: the Bugs, Features and Infrastructure backlogs, the scrum
 * board across all three, then what is staged, what deployed and the site map.
 */
export function developmentPageLinks(projectId: string): DevelopmentPageLink[] {
	const boardHref = projectHref(projectId);
	const backlogLinks = tabsOnBoardSide.development.map((tab) => ({
		key: tab,
		label: boardTabLabels[tab],
		href: `${boardHref}?${boardQueryKeys.department}=${tab}`
	}));
	const scrumBoardLink = { key: developmentPages.board, label: 'Board', href: `${boardHref}?${boardQueryKeys.view}=${developmentViews.board}` };
	const deliveryLinks = deliveryPages.map(({ key, label }) => ({ key, label, href: projectHref(projectId, key) }));
	return [...backlogLinks, scrumBoardLink, ...deliveryLinks];
}
