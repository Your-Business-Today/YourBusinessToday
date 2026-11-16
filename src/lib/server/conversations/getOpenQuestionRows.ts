import type { SupabaseClient } from '@supabase/supabase-js';
import {
	openQuestionsAmong,
	questionsOnOpenTasks,
	type ThreadMessage
} from '$lib/data/openQuestion';
import { getDoneTaskIds } from './getDoneTaskIds';

type QuestionRow = Record<string, unknown> & ThreadMessage;

/**
 * Every question still open for one account, read with the columns the caller asks for: on each
 * goal and task, the latest message waiting on them that they have not spoken after, even when a
 * later message on it waits on someone else. A question on a done task is no longer open.
 */
export async function getOpenQuestionRows(
	supabase: SupabaseClient,
	accountId: string,
	columns: string
): Promise<Record<string, unknown>[]> {
	const everyQuestion = await getQuestionsPutTo(supabase, accountId, columns);
	const taskIds = [...new Set(everyQuestion.flatMap((question) => question.taskId ?? []))];
	const doneTaskIds = await getDoneTaskIds(supabase, taskIds);
	const questions = questionsOnOpenTasks(everyQuestion, doneTaskIds);
	if (questions.length === 0) return [];
	const replies = await getRepliesOnThreads(supabase, accountId, questions);
	return openQuestionsAmong(questions, replies);
}

async function getQuestionsPutTo(
	supabase: SupabaseClient,
	accountId: string,
	columns: string
): Promise<QuestionRow[]> {
	const { data, error } = await supabase
		.from('conversation_messages')
		.select(columns)
		.eq('awaiting_account_id', accountId);
	if (error) throw error;
	const rows = data as unknown as Record<string, unknown>[];
	return rows.map((row) => ({ ...row, ...threadMessageOf(row) }));
}

async function getRepliesOnThreads(
	supabase: SupabaseClient,
	accountId: string,
	questions: ThreadMessage[]
): Promise<ThreadMessage[]> {
	const { data, error } = await supabase
		.from('conversation_messages')
		.select('task_id, goal_id, created_at')
		.eq('author_account_id', accountId)
		.or(threadFilter(questions));
	if (error) throw error;
	return data.map(threadMessageOf);
}

function threadFilter(questions: ThreadMessage[]): string {
	const taskIds = questions.flatMap((question) => question.taskId ?? []);
	const goalIds = questions.flatMap((question) => question.goalId ?? []);
	const filters = [inFilter('task_id', taskIds), inFilter('goal_id', goalIds)];
	return filters.flatMap((filter) => filter ?? []).join(',');
}

function inFilter(column: string, ids: string[]): string | null {
	if (ids.length === 0) return null;
	return `${column}.in.(${ids.join(',')})`;
}

function threadMessageOf(row: Record<string, unknown>): ThreadMessage {
	return {
		taskId: (row.task_id as string) ?? null,
		goalId: (row.goal_id as string) ?? null,
		createdAt: row.created_at as string
	};
}
