import { tabsOnBoardSide } from '$lib/data/boardSide';
import type { DepartmentTab } from '$lib/data/departmentBoard';
import { isAwaitingDesignApproval } from '$lib/data/designReview';
import type { DevelopmentPage } from './developmentPages';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

/** How many items each counted Development tab holds. Deployments and the site map are not counted. */
export type DevelopmentTabCounts = Partial<Record<DevelopmentPage, number>>;

/** The open tasks on Bugs, Features and Infrastructure, the requests awaiting YBT and the tasks staged for the next deploy. */
export function developmentTabCountsOf(
	departmentTabs: DepartmentTab[],
	stagedTaskCount: number,
	requestedTaskCount = 0
): DevelopmentTabCounts {
	const backlogTabs = departmentTabs.filter((departmentTab) => tabsOnBoardSide.development.includes(departmentTab.tab));
	const backlogCounts = backlogTabs.map(({ tab, openTaskCount }) => [tab, openTaskCount]);
	return { ...Object.fromEntries(backlogCounts), requested: requestedTaskCount, staged: stagedTaskCount };
}

/** How many of these tasks change the design and wait for YBT's approval. */
export function designRequestCountOf(tasks: ProjectTask[]): number {
	return tasks.filter((task) => isAwaitingDesignApproval(task.designReview ?? null)).length;
}
