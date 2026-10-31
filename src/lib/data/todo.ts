/** A job a person has to do that must not hold development up, kept on their own list. */
export type TodoStatus = 'to_do' | 'doing' | 'done';

export const todoStatuses = { toDo: 'to_do', doing: 'doing', done: 'done' } as const;

export const todoStatusOrder: TodoStatus[] = ['to_do', 'doing', 'done'];

export const todoStatusLabels: Record<TodoStatus, string> = {
	to_do: 'To do',
	doing: 'Doing',
	done: 'Done'
};

/** The limits the todos table holds a to-do to (migration 0136). */
export const todoLimits = { longestTitle: 200, longestNotes: 4000 } as const;

export function parseTodoStatus(value: unknown): TodoStatus | null {
	return todoStatusOrder.find((status) => status === value) ?? null;
}

export function isTodoOpen(status: TodoStatus): boolean {
	return status !== todoStatuses.done;
}
