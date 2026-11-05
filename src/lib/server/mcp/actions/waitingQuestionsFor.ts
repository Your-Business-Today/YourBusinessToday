import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import type { Account } from '$lib/server/accounts/accountRecord';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { WaitingQuestion } from '$lib/server/conversations/waitingQuestion';

/** The questions waiting on a person, on the projects they can still reach, with who asked each. */
export type WaitingQuestions = { questions: WaitingQuestion[]; askers: Account[] };

export async function withAskers(supabase: SupabaseClient, questions: WaitingQuestion[]): Promise<WaitingQuestions> {
	const askerIds = questions.map((question) => question.authorAccountId);
	const askers = await getAccountsById(supabase, askerIds);
	return { questions, askers };
}
