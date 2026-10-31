import type { SupabaseClient } from '@supabase/supabase-js';
import { todoStatuses } from '$lib/data/todo';
import { parseTodoRecord, todoColumns, type Todo } from './todoRecord';
import type { TodoChanges } from '$lib/data/validateTodo';

/** Where a new to-do sits: whose it is, and the task and project it was born out of. */
export type TodoPlace = {
	ownerAccountId: string | null;
	projectId: string | null;
	taskId: string | null;
};

export async function addTodo(
	supabase: SupabaseClient,
	place: TodoPlace,
	changes: TodoChanges & { title: string },
	createdBy: string
): Promise<Todo> {
	const { data, error } = await supabase
		.from('todos')
		.insert({
			owner_account_id: place.ownerAccountId,
			project_id: place.projectId,
			task_id: place.taskId,
			...changeColumns(changes),
			created_by: createdBy
		})
		.select(todoColumns)
		.single();
	if (error) throw error;
	return parseTodoRecord(data as unknown as Record<string, unknown>);
}

export async function updateTodo(
	supabase: SupabaseClient,
	todoId: string,
	changes: TodoChanges & { ownerAccountId?: string | null }
): Promise<Todo> {
	const owner = 'ownerAccountId' in changes ? { owner_account_id: changes.ownerAccountId } : {};
	const { data, error } = await supabase
		.from('todos')
		.update({ ...changeColumns(changes), ...owner, updated_at: new Date().toISOString() })
		.eq('id', todoId)
		.select(todoColumns)
		.single();
	if (error) throw error;
	return parseTodoRecord(data as unknown as Record<string, unknown>);
}

function changeColumns(changes: TodoChanges): Record<string, unknown> {
	const columns: Record<string, unknown> = {};
	if (changes.title !== undefined) columns.title = changes.title;
	if (changes.notes !== undefined) columns.notes = changes.notes;
	if (changes.dueDate !== undefined) columns.due_date = changes.dueDate;
	if (changes.status !== undefined) {
		columns.status = changes.status;
		const isDone = changes.status === todoStatuses.done;
		columns.completed_at = isDone ? new Date().toISOString() : null;
	}
	return columns;
}
