import { countShownOnTab } from '$lib/components/workspace/countShownOnTab';
import { boardTabLabels, boardTabs, type BoardTab } from '$lib/data/boardTab';
import { tabsOnBoardSide } from '$lib/data/boardSide';
import { boardQueryKeys, projectHref, projectSegments } from './projectAddresses';
import type { BadgeTone } from '$lib/components/site/badgeTones';
import type { DevelopmentTabCounts } from './developmentTabCounts';

/** A page inside Development: one backlog per kind of work, what is staged and deployed, the site map, the goals and the people. */
export type DevelopmentPage = BoardTab | 'staged' | 'deploys' | 'site-map' | 'goals' | 'people';

export const developmentPages = {
	staged: projectSegments.staged,
	deploys: projectSegments.deploys,
	siteMap: projectSegments.siteMap,
	goals: projectSegments.goals,
	people: projectSegments.people
} as const;

export type DevelopmentPageLink = {
	key: DevelopmentPage;
	label: string;
	href: string;
	count: number | null;
	countTone: BadgeTone;
};

const bugCountTone: BadgeTone = 'negative';
const itemCountTone: BadgeTone = 'neutral';

const pagesBeneathBoard = [
	{ key: developmentPages.staged, label: 'Staged' },
	{ key: developmentPages.deploys, label: 'Deployments' },
	{ key: developmentPages.siteMap, label: 'Site map' },
	{ key: developmentPages.goals, label: 'Goals' },
	{ key: developmentPages.people, label: 'People' }
];

/**
 * Development's own tabs, one row beneath the product's: the Bugs, Features and Infrastructure backlogs, then what is
 * staged, what deployed, the site map, the goals and the people. A tab holding items shows how many; an empty or uncounted tab shows none.
 */
export function developmentPageLinks(projectId: string, counts: DevelopmentTabCounts = {}): DevelopmentPageLink[] {
	const boardHref = projectHref(projectId);
	const backlogLinks = tabsOnBoardSide.development.map((tab) => ({
		key: tab,
		label: boardTabLabels[tab],
		href: `${boardHref}?${boardQueryKeys.department}=${tab}`
	}));
	const pageLinks = pagesBeneathBoard.map(({ key, label }) => ({
		key,
		label,
		href: projectHref(projectId, key)
	}));
	return [...backlogLinks, ...pageLinks].map((link) => ({
		...link,
		...countOnTab(link.key, counts)
	}));
}

function countOnTab(page: DevelopmentPage, counts: DevelopmentTabCounts) {
	const isBugs = page === boardTabs.bugs;
	return {
		count: countShownOnTab(counts[page]),
		countTone: isBugs ? bugCountTone : itemCountTone
	};
}
