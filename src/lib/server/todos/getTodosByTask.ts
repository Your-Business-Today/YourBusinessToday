import type { SupabaseClient } from '@supabase/supabase-js';
import { idBatches } from '$lib/server/schema/idBatches';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { parseTodoRecord, todoColumns, type Todo } from './todoRecord';

/** The to-dos under each of these tasks, oldest first, keyed by the task they serve. */
export async function getTodosByTask(supabase: SupabaseClient, taskIds: string[]): Promise<Record<string, Todo[]>> {
	const batches = await Promise.all(idBatches(taskIds).map((batch) => readTodosUnder(supabase, batch)));
	return todosKeyedByTask(batches.flat());
}

async function readTodosUnder(supabase: SupabaseClient, taskIds: string[]): Promise<Todo[]> {
	const query = supabase.from('todos').select(todoColumns).in('task_id', taskIds);
	const { data, error } = await query.order('created_at', { ascending: true });
	if (isSchemaNotYetMigrated(error)) return [];
	if (error) throw error;
	return (data ?? []).map((row) => parseTodoRecord(row as unknown as Record<string, unknown>));
}

function todosKeyedByTask(todos: Todo[]): Record<string, Todo[]> {
	const keyed: Record<string, Todo[]> = {};
	for (const todo of todos) {
		const taskId = todo.taskId ?? '';
		keyed[taskId] = [...(keyed[taskId] ?? []), todo];
	}
	return keyed;
}
