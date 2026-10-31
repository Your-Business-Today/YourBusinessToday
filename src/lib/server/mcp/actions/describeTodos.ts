import { formatBritishDate } from '$lib/data/britishDate';
import { todoStatusLabels } from '$lib/data/todo';
import type { Todo } from '$lib/server/todos/todoRecord';

export const noTodos = 'No to-dos.';

/** One to-do on one line: what, its state and due day, the task it serves, and its id. */
export function todoLine(todo: Todo): string {
	const due = todo.dueDate === null ? '' : `, due ${formatBritishDate(todo.dueDate)}`;
	const state = `${todoStatusLabels[todo.status]}${due}`;
	return `- ${todo.title} — ${state}${servesNote(todo)} (to-do id: ${todo.id})`;
}

export function describeTodos(todos: Todo[]): string[] {
	if (todos.length === 0) return [noTodos];
	return todos.map(todoLine);
}

function servesNote(todo: Todo): string {
	if (todo.taskTitle === null) return '';
	const project = todo.projectName === null ? '' : ` on ${todo.projectName}`;
	return `, for "${todo.taskTitle}"${project} (task id: ${todo.taskId})`;
}
