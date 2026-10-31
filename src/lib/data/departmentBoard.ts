import { isTaskDone, type TaskStatus } from './taskStatus';
import { departmentLabels, departmentOrder, readStoredDepartment, type Department } from './department';

type Departmental = { department: Department };

export type DepartmentTab = { department: Department; label: string; openTaskCount: number };

/** The department a project page shows: the one its address names, else development. */
export function chosenDepartment(url: URL): Department {
	return readStoredDepartment(url.searchParams.get('department'));
}

export function inDepartment<Item extends Departmental>(items: Item[], department: Department): Item[] {
	return items.filter((item) => item.department === department);
}

/** One tab per department, each with how many of its tasks are still open. */
export function departmentTabs(tasks: (Departmental & { status: TaskStatus })[]): DepartmentTab[] {
	const openTasks = tasks.filter((task) => !isTaskDone(task.status));
	return departmentOrder.map((department) => ({
		department,
		label: departmentLabels[department],
		openTaskCount: inDepartment(openTasks, department).length
	}));
}

/** The goals a department's tab shows: its own, and any goal one of its tasks serves from another department. */
export function goalsForDepartment<Goal extends Departmental & { id: string }>(
	goals: Goal[],
	departmentTasks: { goalId: string | null }[],
	department: Department
): Goal[] {
	const servedGoalIds = new Set(departmentTasks.map((task) => task.goalId));
	return goals.filter((goal) => goal.department === department || servedGoalIds.has(goal.id));
}
