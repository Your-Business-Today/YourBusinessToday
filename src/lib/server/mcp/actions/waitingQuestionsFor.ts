import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { getQuestionsWaitingOn } from '$lib/server/conversations/getQuestionsWaitingOn';
import { reachableProjectIds } from '../projectAccess';
import type { Account } from '$lib/server/accounts/accountRecord';
import type { McpCaller } from '../resolveMcpCaller';
import type { WaitingQuestion } from '$lib/server/conversations/waitingQuestion';

/** The questions waiting on a person, on the projects they can still reach, with who asked each. */
export type WaitingQuestions = { questions: WaitingQuestion[]; askers: Account[] };

export async function getWaitingQuestionsFor(caller: McpCaller): Promise<WaitingQuestions> {
	const projectIds = reachableProjectIds(caller);
	const everyQuestion = await getQuestionsWaitingOn(caller.supabase, caller.accountId);
	const questions = everyQuestion.filter((question) => projectIds.includes(question.projectId));
	const askerIds = questions.map((question) => question.authorAccountId);
	const askers = await getAccountsById(caller.supabase, askerIds);
	return { questions, askers };
}
