import { chosenBoardTab, departmentTabs, goalsForBoardTab, inBoardTab } from '$lib/data/departmentBoard';
import { departmentOfBoardTab, developmentKindOfBoardTab } from '$lib/data/boardTab';
import { getGoalsForProject } from '$lib/server/goals/getGoalsForProject';
import { getTasksForProject } from '$lib/server/projects/getTasksForProject';
import type { SupabaseClient } from '@supabase/supabase-js';

/** A project's work as one tab shows it, with every task kept for waits that cross tabs. */
export async function loadDepartmentWork(supabase: SupabaseClient, projectId: string, url: URL) {
	const [projectTasks, projectGoals] = await Promise.all([
		getTasksForProject(supabase, projectId),
		getGoalsForProject(supabase, projectId)
	]);
	const tabs = departmentTabs(projectTasks, projectGoals);
	const boardTab = chosenBoardTab(url, tabs);
	const tasks = inBoardTab(projectTasks, boardTab);
	return {
		projectTasks,
		projectGoals,
		tasks,
		goals: goalsForBoardTab(projectGoals, tasks, boardTab),
		boardTab,
		department: departmentOfBoardTab(boardTab),
		developmentKind: developmentKindOfBoardTab(boardTab),
		departmentTabs: tabs
	};
}
