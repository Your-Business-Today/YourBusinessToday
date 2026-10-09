import type { SupabaseClient } from '@supabase/supabase-js';
import { getDatabaseTask } from './getDatabaseTaskRegister';
import { isPending, type DatabaseTask } from './databaseTaskRecord';

export type RunConfirmation =
	| { kind: 'confirmed'; task: DatabaseTask }
	| { kind: 'already_run'; task: DatabaseTask }
	| { kind: 'no_such_task' };

export const runConfirmations = { confirmed: 'confirmed', alreadyRun: 'already_run', noSuchTask: 'no_such_task' } as const;

/** The admin says a migration has been run: the task is stamped with when and by whom, once. */
export async function confirmDatabaseTaskRun(
	supabase: SupabaseClient,
	taskId: string,
	accountId: string
): Promise<RunConfirmation> {
	const task = await getDatabaseTask(supabase, taskId);
	if (task === null) return { kind: runConfirmations.noSuchTask };
	if (!isPending(task)) return { kind: runConfirmations.alreadyRun, task };
	const runAt = new Date().toISOString();
	const { error } = await supabase
		.from('database_tasks')
		.update({ run_at: runAt, run_by_account_id: accountId })
		.eq('id', taskId)
		.is('run_at', null);
	if (error) throw error;
	return { kind: runConfirmations.confirmed, task: { ...task, runAt, runByAccountId: accountId } };
}
