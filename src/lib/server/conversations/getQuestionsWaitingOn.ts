import type { SupabaseClient } from '@supabase/supabase-js';
import { getOpenQuestionRows } from './getOpenQuestionRows';
import {
	parseWaitingQuestion,
	waitingQuestionColumns,
	type WaitingQuestion
} from './waitingQuestion';

/**
 * Every open question waiting on this account, on goals and tasks alike and done tasks
 * included, the longest waiting first. It only reads: nothing is marked picked up and the
 * inbox marker stays where it is, so asking twice gives the same list.
 */
export async function getQuestionsWaitingOn(
	supabase: SupabaseClient,
	accountId: string
): Promise<WaitingQuestion[]> {
	const rows = await getOpenQuestionRows(supabase, accountId, waitingQuestionColumns);
	return rows.flatMap((row) => parseWaitingQuestion(row) ?? []);
}
