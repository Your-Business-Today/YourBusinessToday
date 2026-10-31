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
