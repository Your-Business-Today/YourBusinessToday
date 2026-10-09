import type { SupabaseClient } from '@supabase/supabase-js';
import { databaseTaskColumns, parseDatabaseTaskRecord, type DatabaseTask } from './databaseTaskRecord';

export type DatabaseTaskRegister = { pending: DatabaseTask[]; recentlyRun: DatabaseTask[] };

export const recentlyRunShown = 20;

/** What the admin has to run, oldest first so the migrations go in order, and what was run lately. */
export async function getDatabaseTaskRegister(supabase: SupabaseClient): Promise<DatabaseTaskRegister> {
	return {
		pending: await readPending(supabase),
		recentlyRun: await readRecentlyRun(supabase)
	};
}

export async function countPendingDatabaseTasks(supabase: SupabaseClient): Promise<number> {
	const { count, error } = await supabase
		.from('database_tasks')
		.select('id', { count: 'exact', head: true })
		.is('run_at', null);
	if (error) throw error;
	return count ?? 0;
}

export async function getDatabaseTask(supabase: SupabaseClient, taskId: string): Promise<DatabaseTask | null> {
	const { data, error } = await supabase
		.from('database_tasks')
		.select(databaseTaskColumns)
		.eq('id', taskId)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return parseDatabaseTaskRecord(data);
}

async function readPending(supabase: SupabaseClient): Promise<DatabaseTask[]> {
	const { data, error } = await supabase
		.from('database_tasks')
		.select(databaseTaskColumns)
		.is('run_at', null)
		.order('raised_at', { ascending: true })
		.order('file_path', { ascending: true });
	if (error) throw error;
	return data.map(parseDatabaseTaskRecord);
}

async function readRecentlyRun(supabase: SupabaseClient): Promise<DatabaseTask[]> {
	const { data, error } = await supabase
		.from('database_tasks')
		.select(databaseTaskColumns)
		.not('run_at', 'is', null)
		.order('run_at', { ascending: false })
		.limit(recentlyRunShown);
	if (error) throw error;
	return data.map(parseDatabaseTaskRecord);
}
