import { accountNameLookup } from '$lib/data/accountNames';
import { todoStatusLabels } from '$lib/data/todo';
import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';
import type { Todo } from '$lib/server/todos/todoRecord';

const nobodyTakenLabel = 'anyone on the project';

/** The to-dos born out of a task: whose each is and where it stands. They never hold the task up. */
export function taskTodoLines(todos: Todo[], people: ProjectPerson[]): string[] {
	if (todos.length === 0) return ['To-dos: none.'];
	const nameOf = accountNameLookup(people);
	const lines = todos.map((todo) => {
		const owner = todo.ownerAccountId === null ? nobodyTakenLabel : nameOf(todo.ownerAccountId);
		return `- ${todo.title} — ${owner}, ${todoStatusLabels[todo.status]} (to-do id: ${todo.id})`;
	});
	return ['To-dos born out of it (they never hold it up):', ...lines];
}
