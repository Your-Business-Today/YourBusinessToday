import type { SupabaseClient } from '@supabase/supabase-js';
import { accountNameLookup } from '$lib/data/accountNames';
import { awaitingKinds, parseAwaitingKind } from '$lib/data/conversationTurn';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { parseGlobalTaskRow, type GlobalTask } from '$lib/server/projects/getGlobalTaskPage';
import { getOpenQuestionRows } from './getOpenQuestionRows';

/** A task with a question open for the viewer, and who asked it. */
export type WaitingTask = GlobalTask & {
	passedByName: string;
	isForYourClaude: boolean;
	since: string;
};

type WaitingTurn = {
	taskId: string;
	authorAccountId: string;
	isForYourClaude: boolean;
	since: string;
};

/** Every task, across every project, with a question waiting on the viewer — the longest wait first. */
export async function getTasksWaitingOnYou(
	supabase: SupabaseClient,
	accountId: string
): Promise<WaitingTask[]> {
	const turns = await getTurnsWaitingOn(supabase, accountId);
	const taskIds = turns.map((turn) => turn.taskId);
	const authorIds = turns.map((turn) => turn.authorAccountId);
	const [taskById, accounts] = await Promise.all([
		getTasksById(supabase, taskIds),
		getAccountsById(supabase, authorIds)
	]);
	const nameOf = accountNameLookup(accounts);
	return turns.flatMap((turn) => {
		const task = taskById.get(turn.taskId);
		if (task === undefined) return [];
		const passedByName = nameOf(turn.authorAccountId);
		return [
			{
				...task,
				passedByName,
				isForYourClaude: turn.isForYourClaude,
				since: turn.since
			}
		];
	});
}

async function getTurnsWaitingOn(
	supabase: SupabaseClient,
	accountId: string
): Promise<WaitingTurn[]> {
	const columns = 'task_id, goal_id, author_account_id, awaiting_kind, created_at';
	const rows = await getOpenQuestionRows(supabase, accountId, columns);
	return rows.filter((row) => row.task_id !== null).map(parseWaitingTurn);
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

async function getTasksById(
	supabase: SupabaseClient,
	taskIds: string[]
): Promise<Map<string, GlobalTask>> {
	if (taskIds.length === 0) return new Map();
	const { data, error } = await supabase
		.from('tasks')
		.select('*, projects!inner(name)')
		.in('id', taskIds);
	if (error) throw error;
	const tasks = data.map(parseGlobalTaskRow);
	return new Map(tasks.map((task) => [task.id, task]));
}
