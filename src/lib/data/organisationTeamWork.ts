import { departmentLabels, type Department } from './department';
import { internalDepartments } from './boardSide';
import type { TaskStatus } from './taskStatus';

/** One of the team's jobs as the organisation's Tasks page lists it: what it is, whose department does it, on which product, who has it, and when it is due. */
export type TeamWorkItem = {
	id: string;
	title: string;
	department: Department;
	status: TaskStatus;
	dueDate: string | null;
	productId: string;
	productName: string;
	assigneeIds: string[];
	href: string;
};

export type TeamWorkGroup = { department: Department; label: string; items: TeamWorkItem[] };

type TeamTask = { id: string; projectId: string; department: Department; title: string; status: TaskStatus; dueDate: string | null };

type Product = { id: string; name: string };

const undatedLast = '9999-12-31';

/** The team's open jobs across the organisation's products, a group per department, the soonest due first, each with the people assigned to it. */
export function teamWorkGroups(tasks: TeamTask[], products: Product[], assigneeIdsByTask = new Map<string, string[]>()): TeamWorkGroup[] {
	const productNames = new Map(products.map((product) => [product.id, product.name]));
	const itemOf = (task: TeamTask) => teamWorkItemOf(task, productNames.get(task.projectId) ?? '', assigneeIdsByTask.get(task.id) ?? []);
	return internalDepartments.map((department) => {
		const departmentTasks = tasks.filter((task) => task.department === department);
		return { department, label: departmentLabels[department], items: departmentTasks.map(itemOf).sort(bySoonestDue) };
	});
}

/** Every department's jobs as one list, the soonest due first. */
export function teamWorkAcross(groups: TeamWorkGroup[]): TeamWorkItem[] {
	return groups.flatMap(({ items }) => items).sort(bySoonestDue);
}

function teamWorkItemOf(task: TeamTask, productName: string, assigneeIds: string[]): TeamWorkItem {
	const { id, title, department, status, dueDate, projectId } = task;
	const href = `/projects/${projectId}/tasks/${id}`;
	return { id, title, department, status, dueDate, productId: projectId, productName, assigneeIds, href };
}

function bySoonestDue(first: TeamWorkItem, second: TeamWorkItem): number {
	return (first.dueDate ?? undatedLast).localeCompare(second.dueDate ?? undatedLast);
}
