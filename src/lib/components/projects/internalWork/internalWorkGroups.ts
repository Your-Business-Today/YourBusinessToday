import { departmentLabels, type Department } from '$lib/data/department';
import { internalDepartments } from '$lib/data/boardSide';
import { isTaskDone } from '$lib/data/taskStatus';
import { writeShownIds } from '$lib/data/shownIds';
import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';

/** Where an item stands among the items shown beside it: its group's items under the same parent. */
export type ItemPlace = { position: number; count: number; shownIds: string };

/** A row of the Internal work board: an item, how far its subtask sits in from the item above it, and its place. */
export type InternalItem = { id: string; task: TaskTreeNode; depth: number; place: ItemPlace };

export type InternalWorkGroup = {
	department: Department;
	label: string;
	openItemCount: number;
	items: InternalItem[];
};

/** The Internal work board as monday.com draws it: a group per department, each item followed by its subtasks. */
export function internalWorkGroups(shownTree: TaskTreeNode[]): InternalWorkGroup[] {
	return internalDepartments.map((department) => {
		const items = itemsOf(
			shownTree.filter((task) => task.department === department),
			0
		);
		const openItems = items.filter(({ task }) => !isTaskDone(task.status));
		return { department, label: departmentLabels[department], openItemCount: openItems.length, items };
	});
}

function itemsOf(tasks: TaskTreeNode[], depth: number): InternalItem[] {
	const shownIds = writeShownIds(tasks.map((task) => task.id));
	return tasks.flatMap((task, index) => {
		const place = { position: index + 1, count: tasks.length, shownIds };
		return [{ id: task.id, task, depth, place }, ...itemsOf(task.subtasks, depth + 1)];
	});
}
