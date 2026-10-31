import { departmentLabels, departmentOrder, type Department } from './department';

export type DepartmentGroup<Task> = { department: Department; label: string; tasks: Task[] };

/** A person's tasks under their departments, development first, leaving out departments with none. */
export function tasksByDepartment<Task extends { department: Department }>(tasks: Task[]): DepartmentGroup<Task>[] {
	return departmentOrder
		.map((department) => ({
			department,
			label: departmentLabels[department],
			tasks: tasks.filter((task) => task.department === department)
		}))
		.filter(hasTasks);
}

function hasTasks<Task>({ tasks }: DepartmentGroup<Task>): boolean {
	return tasks.length > 0;
}
