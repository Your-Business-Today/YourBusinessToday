import { chosenBoardTab, departmentTabs, goalsForBoardTabs, inBoardTabs, tabsShownWith } from '$lib/data/departmentBoard';
import { departmentOfBoardTab, developmentKindOfBoardTab } from '$lib/data/boardTab';
import { boardSideOfTab } from '$lib/data/boardSide';
import { boardSidesOfProject, isInternalProject } from '$lib/data/internalProject';
import { getGoalsForProject } from '$lib/server/goals/getGoalsForProject';
import { getTasksForProject } from '$lib/server/projects/getTasksForProject';
import type { SupabaseClient } from '@supabase/supabase-js';

type BoardedProject = { id: string; repositoryUrl: string };

/**
 * A project's work as one tab shows it, on its side of the page, with every task kept for waits that cross tabs.
 * Task Management is one board grouped by department, so any of its tabs shows all three departments.
 * An internal project shows Task Management alone.
 */
export async function loadDepartmentWork(supabase: SupabaseClient, project: BoardedProject, url: URL) {
	const [projectTasks, projectGoals] = await Promise.all([
		getTasksForProject(supabase, project.id),
		getGoalsForProject(supabase, project.id)
	]);
	const isInternal = isInternalProject(project, [...projectTasks, ...projectGoals]);
	const shownSides = boardSidesOfProject(isInternal);
	const tabs = departmentTabs(projectTasks, projectGoals);
	const boardTab = chosenBoardTab(url, tabs, shownSides);
	const shownTabs = tabsShownWith(boardTab);
	const tasks = inBoardTabs(projectTasks, shownTabs);
	return {
		projectTasks,
		projectGoals,
		tasks,
		goals: goalsForBoardTabs(projectGoals, tasks, shownTabs),
		boardTab,
		departmentTabs: tabs,
		department: departmentOfBoardTab(boardTab),
		developmentKind: developmentKindOfBoardTab(boardTab),
		isInternalProject: isInternal,
		boardSide: boardSideOfTab(boardTab)
	};
}
