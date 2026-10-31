import type { SupabaseClient } from '@supabase/supabase-js';
import { todoStatuses } from '$lib/data/todo';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { parseTodoRecord, todoColumns, type Todo } from './todoRecord';

/** A person's own to-dos, open first by due date, then the ones they have finished. */
export async function getTodosOwnedBy(supabase: SupabaseClient, accountId: string): Promise<Todo[]> {
	const query = supabase.from('todos').select(todoColumns).eq('owner_account_id', accountId);
	return readTodos(await query.order('due_date', { ascending: true, nullsFirst: false }));
}

/** The to-dos linked to one task, whoever's they are, and the ones nobody has taken yet. */
export async function getTodosForTask(supabase: SupabaseClient, taskId: string): Promise<Todo[]> {
	const query = supabase.from('todos').select(todoColumns).eq('task_id', taskId);
	return readTodos(await query.order('created_at', { ascending: true }));
}

/** The to-dos on these projects that nobody has taken yet, for anyone on them to pick up. */
export async function getUntakenTodos(supabase: SupabaseClient, projectIds: string[]): Promise<Todo[]> {
	if (projectIds.length === 0) return [];
	const query = supabase.from('todos').select(todoColumns).is('owner_account_id', null);
	return readTodos(await query.in('project_id', projectIds).neq('status', todoStatuses.done));
}

export async function getTodo(supabase: SupabaseClient, todoId: string): Promise<Todo | null> {
	const { data, error } = await supabase.from('todos').select(todoColumns).eq('id', todoId).maybeSingle();
	if (error) throw error;
	return data === null ? null : parseTodoRecord(data as unknown as Record<string, unknown>);
}

type TodoAnswer = { data: unknown[] | null; error: unknown };

function readTodos({ data, error }: TodoAnswer): Todo[] {
	if (isSchemaNotYetMigrated(error)) return [];
	if (error) throw error;
	return (data ?? []).map((row) => parseTodoRecord(row as Record<string, unknown>));
}
