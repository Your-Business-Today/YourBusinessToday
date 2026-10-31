import { parseTodoStatus, todoStatuses, type TodoStatus } from '$lib/data/todo';

/** A to-do as read, with the task it is linked to and that task's project, when it has one. */
export type Todo = {
	id: string;
	ownerAccountId: string | null;
	projectId: string | null;
	taskId: string | null;
	taskTitle: string | null;
	projectName: string | null;
	title: string;
	notes: string | null;
	status: TodoStatus;
	dueDate: string | null;
	createdBy: string;
	createdAt: string;
	completedAt: string | null;
};

type LinkedTask = { title: string } | null;
type LinkedProject = { name: string } | null;

export const todoColumns =
	'id, owner_account_id, project_id, task_id, title, notes, status, due_date, created_by, ' +
	'created_at, completed_at, tasks(title), projects(name)';

export function parseTodoRecord(row: Record<string, unknown>): Todo {
	const task = row.tasks as LinkedTask;
	const project = row.projects as LinkedProject;
	return {
		id: row.id as string,
		ownerAccountId: (row.owner_account_id as string) ?? null,
		projectId: (row.project_id as string) ?? null,
		taskId: (row.task_id as string) ?? null,
		taskTitle: task?.title ?? null,
		projectName: project?.name ?? null,
		title: row.title as string,
		notes: (row.notes as string) ?? null,
		status: parseTodoStatus(row.status) ?? todoStatuses.toDo,
		dueDate: (row.due_date as string) ?? null,
		createdBy: row.created_by as string,
		createdAt: row.created_at as string,
		completedAt: (row.completed_at as string) ?? null
	};
}
