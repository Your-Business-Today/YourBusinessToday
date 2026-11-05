import { isTaskDone, type TaskStatus } from './taskStatus';
import { currentWork, type HorizonedGoal, type PlacedTask } from './taskHorizons';
import { type Department } from './department';
import {
	boardTabLabels,
	boardTabOfTask,
	boardTabOrder,
	boardTabs,
	departmentOfBoardTab,
	parseBoardTab,
	type BoardTab
} from './boardTab';

type Departmental = { department: Department };

type BoardTask = Departmental & {
	id: string;
	parentTaskId: string | null;
	title: string;
};

export type DepartmentTab = {
	tab: BoardTab;
	label: string;
	openTaskCount: number;
};

/**
 * The tab a project page shows: the one its address names, else Bugs while any bug is open, so a
 * feature that has stopped working is the first thing seen, else Features.
 */
export function chosenBoardTab(url: URL, tabs: DepartmentTab[]): BoardTab {
	const named = parseBoardTab(url.searchParams.get('department'));
	if (named !== null) return named;
	const bugs = tabs.find((tab) => tab.tab === boardTabs.bugs);
	return (bugs?.openTaskCount ?? 0) > 0 ? boardTabs.bugs : boardTabs.features;
}

export function inBoardTab<Item extends BoardTask>(
	items: Item[],
	tab: BoardTab,
	allTasks: BoardTask[] = items
): Item[] {
	const tasksById = new Map(allTasks.map((task) => [task.id, task]));
	return items.filter((item) => boardTabOfTask(item, tasksById) === tab);
}

type TabbedTask = BoardTask & PlacedTask & { status: TaskStatus };

/** One tab per department, development split into Bugs and Features, each with how many of its current tasks are still open: long term work is not scoped enough to count. */
export function departmentTabs(tasks: TabbedTask[], goals: HorizonedGoal[]): DepartmentTab[] {
	const openTasks = currentWork(tasks, goals).filter((task) => !isTaskDone(task.status));
	return boardTabOrder.map((tab) => ({
		tab,
		label: boardTabLabels[tab],
		openTaskCount: inBoardTab(openTasks, tab, tasks).length
	}));
}

/**
 * The goals a tab shows: any goal one of its tasks serves, from whichever department, and its
 * department's own goals. Bugs shows only the goals its bugs serve: a goal is new work, raised on
 * Features.
 */
export function goalsForBoardTab<Goal extends Departmental & { id: string }>(
	goals: Goal[],
	tabTasks: { goalId: string | null }[],
	tab: BoardTab
): Goal[] {
	const servedGoalIds = new Set(tabTasks.map((task) => task.goalId));
	const isBugs = tab === boardTabs.bugs;
	const department = departmentOfBoardTab(tab);
	return goals.filter((goal) => servedGoalIds.has(goal.id) || (!isBugs && goal.department === department));
}
