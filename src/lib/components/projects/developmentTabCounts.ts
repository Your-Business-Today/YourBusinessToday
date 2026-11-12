import { tabsOnBoardSide } from '$lib/data/boardSide';
import type { DepartmentTab } from '$lib/data/departmentBoard';
import type { DevelopmentPage } from './developmentPages';

/** How many items each counted Development tab holds. Deployments and the site map are not counted. */
export type DevelopmentTabCounts = Partial<Record<DevelopmentPage, number>>;

/** The open tasks on Bugs, Features and Infrastructure, and the tasks staged for the next deploy. */
export function developmentTabCountsOf(departmentTabs: DepartmentTab[], stagedTaskCount: number): DevelopmentTabCounts {
	const backlogTabs = departmentTabs.filter((departmentTab) => tabsOnBoardSide.development.includes(departmentTab.tab));
	const backlogCounts = backlogTabs.map(({ tab, openTaskCount }) => [tab, openTaskCount]);
	return { ...Object.fromEntries(backlogCounts), staged: stagedTaskCount };
}
