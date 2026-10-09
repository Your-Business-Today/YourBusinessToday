import type { SupabaseClient } from '@supabase/supabase-js';
import { accountNameLookup } from '$lib/data/accountNames';
import { awaitingKinds, parseAwaitingKind } from '$lib/data/conversationTurn';
import { doneTaskStatus } from '$lib/data/taskStatus';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { parseGlobalTaskRow, type GlobalTask } from '$lib/server/projects/getGlobalTaskPage';

/** An open task whose latest message hands the baton to the viewer, and who handed it. */
export type WaitingTask = GlobalTask & {
	passedByName: string;
	isForYourClaude: boolean;
	since: string;
};

type WaitingTurn = { taskId: string; authorAccountId: string; isForYourClaude: boolean; since: string };

/** Every open task, across every project, waiting on the viewer's reply — the longest wait first. */
export async function getTasksWaitingOnYou(
	supabase: SupabaseClient,
	accountId: string
): Promise<WaitingTask[]> {
	const turns = await getTurnsWaitingOn(supabase, accountId);
	const taskIds = turns.map((turn) => turn.taskId);
	const authorIds = turns.map((turn) => turn.authorAccountId);
	const [taskById, accounts] = await Promise.all([
		getOpenTasksById(supabase, taskIds),
		getAccountsById(supabase, authorIds)
	]);
	const nameOf = accountNameLookup(accounts);
	return turns.flatMap((turn) => {
		const task = taskById.get(turn.taskId);
		if (task === undefined) return [];
		const passedByName = nameOf(turn.authorAccountId);
		return [{ ...task, passedByName, isForYourClaude: turn.isForYourClaude, since: turn.since }];
	});
}

async function getTurnsWaitingOn(supabase: SupabaseClient, accountId: string): Promise<WaitingTurn[]> {
	const { data, error } = await supabase
		.from('conversation_turns')
		.select('task_id, author_account_id, awaiting_kind, created_at')
		.eq('awaiting_account_id', accountId)
		.not('task_id', 'is', null)
		.order('created_at', { ascending: true });
	if (error) throw error;
	return data.map(parseWaitingTurn);
}

function parseWaitingTurn(row: Record<string, unknown>): WaitingTurn {
	const awaitingKind = parseAwaitingKind(row.awaiting_kind);
	return {
		taskId: row.task_id as string,
		authorAccountId: row.author_account_id as string,
		isForYourClaude: awaitingKind === awaitingKinds.claude,
		since: row.created_at as string
	};
}

async function getOpenTasksById(
	supabase: SupabaseClient,
	taskIds: string[]
): Promise<Map<string, GlobalTask>> {
	if (taskIds.length === 0) return new Map();
	const { data, error } = await supabase
		.from('tasks')
		.select('*, projects!inner(name)')
		.in('id', taskIds)
		.neq('status', doneTaskStatus);
	if (error) throw error;
	const tasks = data.map(parseGlobalTaskRow);
	return new Map(tasks.map((task) => [task.id, task]));
}
