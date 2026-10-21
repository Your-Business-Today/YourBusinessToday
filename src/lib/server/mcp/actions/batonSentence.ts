import { accountNameLookup } from '$lib/data/accountNames';
import { currentTurn } from '$lib/data/currentTurn';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { getThread } from '$lib/server/conversations/getThread';
import { awaitingKinds } from '$lib/data/conversationTurn';
import type { ConversationSubject } from '$lib/server/conversations/conversationSubject';
import type { McpCaller } from '../resolveMcpCaller';

const shouldIncludeInternal = false;

/** Who holds the baton on the thread once the message is posted, read as read_task reads it. */
export async function batonSentence(caller: McpCaller, subject: ConversationSubject): Promise<string> {
	const messages = await getThread(caller.supabase, subject, shouldIncludeInternal);
	const awaiting = currentTurn(messages)?.awaiting ?? null;
	if (awaiting === null) return 'Nobody is waiting on anything now.';
	const accounts = await getAccountsById(caller.supabase, [awaiting.accountId]);
	const name = accountNameLookup(accounts)(awaiting.accountId);
	if (awaiting.kind === awaitingKinds.claude) return `The baton is with ${name}’s Claude to answer.`;
	return `The baton is with ${name}: their Claude will bring it to them.`;
}
