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
import { openingTabOfSide } from './boardSideTabs';
import { boardSideOfTab, boardSideOrder, boardSides, tabsOnBoardSide, type BoardSide } from './boardSide';

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
 * The tab a project page shows: the one its address names, on whichever shown side it sits, else the tab
 * the first shown side opens on, which is Development unless the project is internal.
 */
export function chosenBoardTab(url: URL, tabs: DepartmentTab[], shownSides: BoardSide[] = boardSideOrder): BoardTab {
	const named = parseBoardTab(url.searchParams.get('department'));
	const [firstSide] = shownSides;
	if (isShownTab(named, shownSides)) return named;
	return openingTabOfSide(firstSide, tabs);
}

function isShownTab(tab: BoardTab | null, shownSides: BoardSide[]): tab is BoardTab {
	if (tab === null) return false;
	return shownSides.includes(boardSideOfTab(tab));
}

export function inBoardTab<Item extends BoardTask>(
	items: Item[],
	tab: BoardTab,
	allTasks: BoardTask[] = items
): Item[] {
	return inBoardTabs(items, [tab], allTasks);
}

export function inBoardTabs<Item extends BoardTask>(items: Item[], tabs: BoardTab[], allTasks: BoardTask[] = items): Item[] {
	const tasksById = new Map(allTasks.map((task) => [task.id, task]));
	return items.filter((item) => tabs.includes(boardTabOfTask(item, tasksById)));
}

/** The tabs whose work a page shows together: one Development tab, or every Internal work department, which is one board grouped by department. */
export function tabsShownWith(tab: BoardTab): BoardTab[] {
	if (boardSideOfTab(tab) === boardSides.internal) return tabsOnBoardSide.internal;
	return [tab];
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
export function goalsForBoardTabs<Goal extends Departmental & { id: string }>(
	goals: Goal[],
	tabTasks: { goalId: string | null }[],
	tabs: BoardTab[]
): Goal[] {
	const servedGoalIds = new Set(tabTasks.map((task) => task.goalId));
	const raisingTabs = tabs.filter((tab) => tab !== boardTabs.bugs);
	const departmentsRaising = raisingTabs.map(departmentOfBoardTab);
	return goals.filter((goal) => servedGoalIds.has(goal.id) || departmentsRaising.includes(goal.department));
}
