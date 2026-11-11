import { boardSides, type BoardSide } from './boardSide';
import { boardTabs, type BoardTab } from './boardTab';
import type { DepartmentTab } from './departmentBoard';

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
