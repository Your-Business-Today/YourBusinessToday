import { departmentLabels, type Department } from './department';
import { internalDepartments } from './boardSide';
import type { TaskStatus } from './taskStatus';

/** One of the team's jobs as the organisation's Tasks page lists it: what it is, whose department does it, on which product, who has it, whose move it is, and when it is due. */
export type TeamWorkItem = {
	id: string;
	title: string;
	department: Department;
	status: TaskStatus;
	dueDate: string | null;
	productId: string;
	productName: string;
	assigneeIds: string[];
	nextActionIds: string[];
	href: string;
};

export type TeamWorkGroup = { department: Department; label: string; items: TeamWorkItem[] };

type TeamTask = { id: string; projectId: string; department: Department; title: string; status: TaskStatus; dueDate: string | null };

type Product = { id: string; name: string };

/** Who is on each job and whose move each job is, by the next-action rule. */
export type PeopleOnJobs = { assigneeIdsByTask: Map<string, string[]>; nextActionIdsByTask: Map<string, string[]> };

type PeopleOnJob = { assigneeIds: string[]; nextActionIds: string[] };

const noPeopleOnJobs: PeopleOnJobs = { assigneeIdsByTask: new Map(), nextActionIdsByTask: new Map() };

const undatedLast = '9999-12-31';

/** The team's open jobs across the organisation's products, a group per department, the soonest due first, each with the people assigned to it. */
export function teamWorkGroups(tasks: TeamTask[], products: Product[], people: PeopleOnJobs = noPeopleOnJobs): TeamWorkGroup[] {
	const productNames = new Map(products.map((product) => [product.id, product.name]));
	const itemOf = (task: TeamTask) => teamWorkItemOf(task, productNames.get(task.projectId) ?? '', peopleOn(task.id, people));
	return internalDepartments.map((department) => {
		const departmentTasks = tasks.filter((task) => task.department === department);
		return { department, label: departmentLabels[department], items: departmentTasks.map(itemOf).sort(bySoonestDue) };
	});
}

/** Every department's jobs as one list, the soonest due first. */
export function teamWorkAcross(groups: TeamWorkGroup[]): TeamWorkItem[] {
	return groups.flatMap(({ items }) => items).sort(bySoonestDue);
}

function teamWorkItemOf(task: TeamTask, productName: string, onJob: PeopleOnJob): TeamWorkItem {
	const { id, title, department, status, dueDate, projectId } = task;
	const href = `/projects/${projectId}/tasks/${id}`;
	return { id, title, department, status, dueDate, productId: projectId, productName, ...onJob, href };
}

function peopleOn(taskId: string, people: PeopleOnJobs): PeopleOnJob {
	const assigneeIds = people.assigneeIdsByTask.get(taskId) ?? [];
	const nextActionIds = people.nextActionIdsByTask.get(taskId) ?? assigneeIds;
	return { assigneeIds, nextActionIds };
}

function bySoonestDue(first: TeamWorkItem, second: TeamWorkItem): number {
	return (first.dueDate ?? undatedLast).localeCompare(second.dueDate ?? undatedLast);
}
