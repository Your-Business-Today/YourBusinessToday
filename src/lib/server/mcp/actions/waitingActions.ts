import { describeWaitingQuestions } from './describeWaitingQuestions';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { getQuestionsWaitingOn } from '$lib/server/conversations/getQuestionsWaitingOn';
import { objectSchema } from '../actionTypes';
import { reachableProjectIds } from '../projectAccess';
import type { McpAction } from '../actionTypes';

export const waitingActions: McpAction[] = [
	{
		name: 'list_waiting_on_me',
		area: 'conversations',
		audience: 'everyone',
		isWrite: false,
		summary:
			'every question waiting on you across your projects, done tasks included, without moving the read marker',
		guidance:
			'Use it on a routine check, or whenever the person asks what is waiting on them: it ' +
			'reads only, so calling it again gives the same list until a question is answered. ' +
			'Each question names the project, the goal or task, who asked and when. Answer one ' +
			'with post_message on the same goal or task; it leaves the list once the person it ' +
			'waits on has spoken there. read_latest_messages is still how new messages are read.',
		inputSchema: objectSchema({}),
		run: async (caller) => {
			const projectIds = reachableProjectIds(caller);
			const everyQuestion = await getQuestionsWaitingOn(caller.supabase, caller.accountId);
			const questions = everyQuestion.filter((question) =>
				projectIds.includes(question.projectId)
			);
			const askerIds = questions.map((question) => question.authorAccountId);
			const accounts = await getAccountsById(caller.supabase, askerIds);
			return describeWaitingQuestions(questions, accounts, caller.accountId);
		}
	}
];
