import { boardTabLabels, boardTabOfTask, boardTabOrder, type BoardTab } from './boardTab';
import { currentWork, type HorizonedGoal, type PlacedTask } from './taskHorizons';
import { isTaskDone, type TaskStatus } from './taskStatus';
import type { Department } from './department';

type AssignableTask = PlacedTask & { id: string; parentTaskId: string | null; title: string; department: Department; status: TaskStatus };

/** How many of the viewer's open current tasks sit on a tab the page is not showing. */
export type AssignedElsewhere = { tab: BoardTab; label: string; count: number };

type Placing = { tasks: AssignableTask[]; goals: HorizonedGoal[]; assignedTaskIds: string[]; shownTabs: BoardTab[] };

/**
 * The viewer's open current tasks on the project's other tabs, counted as the project list counts
 * them, so "Assigned to me" on one tab never hides work that the project's own count includes.
 */
export function assignedElsewhere(placing: Placing): AssignedElsewhere[] {
	const { tasks, goals, assignedTaskIds, shownTabs } = placing;
	const tasksById = new Map(tasks.map((task) => [task.id, task]));
	const isViewersOpenTask = (task: AssignableTask) => assignedTaskIds.includes(task.id) && !isTaskDone(task.status);
	const viewersTasks = currentWork(tasks, goals).filter(isViewersOpenTask);
	const tabs = viewersTasks.map((task) => boardTabOfTask(task, tasksById));
	return boardTabOrder
		.filter((tab) => !shownTabs.includes(tab))
		.map((tab) => ({ tab, label: boardTabLabels[tab], count: tabs.filter((taskTab) => taskTab === tab).length }))
		.filter((elsewhere) => elsewhere.count > 0);
}
