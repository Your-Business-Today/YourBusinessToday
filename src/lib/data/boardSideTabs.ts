import { boardSideLabels, boardSideOfTab, boardSideOrder, boardSides, tabsOnBoardSide, type BoardSide } from './boardSide';
import { boardTabs, type BoardTab } from './boardTab';
import type { DepartmentTab } from './departmentBoard';

/** A side of the project page as its switch shows it: how much is open on it and the tab a click on it opens. */
export type SideTab = {
	side: BoardSide;
	label: string;
	openTaskCount: number;
	openingTab: BoardTab;
};

const frontTabs: Record<BoardSide, BoardTab> = {
	development: boardTabs.features,
	internal: boardTabs.administration
};

/** The tab a side opens on: Development opens on Bugs while any bug is open, so a feature that has stopped working is seen first. */
export function openingTabOfSide(side: BoardSide, tabs: DepartmentTab[]): BoardTab {
	const bugs = tabs.find((tab) => tab.tab === boardTabs.bugs);
	const hasOpenBugs = (bugs?.openTaskCount ?? 0) > 0;
	if (side === boardSides.development && hasOpenBugs) return boardTabs.bugs;
	return frontTabs[side];
}

export function tabsOfSide(tabs: DepartmentTab[], side: BoardSide): DepartmentTab[] {
	return tabs.filter((tab) => tabsOnBoardSide[side].includes(tab.tab));
}

export function sideTabsOf(tabs: DepartmentTab[], shownSides: BoardSide[] = boardSideOrder): SideTab[] {
	return shownSides.map((side) => ({
		side,
		label: boardSideLabels[side],
		openTaskCount: tabsOfSide(tabs, side).reduce((count, tab) => count + tab.openTaskCount, 0),
		openingTab: openingTabOfSide(side, tabs)
	}));
}

/** The sides the project shows and the open side's own tabs, for the tab the page shows. */
export function boardSidesFor(tabs: DepartmentTab[], selectedTab: BoardTab, shownSides: BoardSide[] = boardSideOrder) {
	const boardSide = boardSideOfTab(selectedTab);
	return { boardSide, sideTabs: sideTabsOf(tabs, shownSides), departmentTabs: tabsOfSide(tabs, boardSide) };
}
