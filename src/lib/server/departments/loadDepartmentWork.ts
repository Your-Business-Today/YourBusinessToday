import { chosenBoardTab, departmentTabs, goalsForBoardTabs, inBoardTabs, tabsShownWith } from '$lib/data/departmentBoard';
import { departmentOfBoardTab, developmentKindOfBoardTab } from '$lib/data/boardTab';
import { boardSidesFor } from '$lib/data/boardSideTabs';
import { getGoalsForProject } from '$lib/server/goals/getGoalsForProject';
import { getTasksForProject } from '$lib/server/projects/getTasksForProject';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * A project's work as one tab shows it, on its side of the page, with every task kept for waits that cross tabs.
 * Internal work is one board grouped by department, so any of its tabs shows all three departments.
 */
export async function loadDepartmentWork(supabase: SupabaseClient, projectId: string, url: URL) {
	const [projectTasks, projectGoals] = await Promise.all([
		getTasksForProject(supabase, projectId),
		getGoalsForProject(supabase, projectId)
	]);
	const tabs = departmentTabs(projectTasks, projectGoals);
	const boardTab = chosenBoardTab(url, tabs);
	const shownTabs = tabsShownWith(boardTab);
	const tasks = inBoardTabs(projectTasks, shownTabs);
	return {
		projectTasks,
		projectGoals,
		tasks,
		goals: goalsForBoardTabs(projectGoals, tasks, shownTabs),
		boardTab,
		department: departmentOfBoardTab(boardTab),
		developmentKind: developmentKindOfBoardTab(boardTab),
		...boardSidesFor(tabs, boardTab)
	};
}
