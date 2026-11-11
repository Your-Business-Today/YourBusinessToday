import { departmentLabels, type Department } from '$lib/data/department';
import { internalDepartments } from '$lib/data/boardSide';
import { isTaskDone } from '$lib/data/taskStatus';
import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';

/** A row of the Internal work board: an item, and how far its subtask sits in from the item above it. */
export type InternalItem = { id: string; task: TaskTreeNode; depth: number };

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
	return tasks.flatMap((task) => [{ id: task.id, task, depth }, ...itemsOf(task.subtasks, depth + 1)]);
}
