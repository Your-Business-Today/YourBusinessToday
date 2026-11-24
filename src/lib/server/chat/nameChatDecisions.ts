import { accountNameLookup } from '$lib/data/accountNames';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { chatMessagesTable } from './chatMessageRecord';
import type { ChatDecision, ListedChatDecision } from '$lib/data/chat/chatDecisionRules';
import type { ChatRoom } from '$lib/data/chat/chatRoomRules';
import type { SupabaseClient } from '@supabase/supabase-js';

type MessageWordsRow = { id: string; body: string };

const roomNoLongerKnown = 'another room';

/** The words of each message the decisions came from, wherever the message is now. */
async function readWordsOfMessages(supabase: SupabaseClient, messageIds: string[]): Promise<Map<string, string>> {
	if (messageIds.length === 0) return new Map();
	const { data, error } = await supabase.from(chatMessagesTable).select('id, body').in('id', messageIds);
	if (error !== null) throw error;
	return new Map((data as MessageWordsRow[]).map((row) => [row.id, row.body]));
}

function accountsNamedBy(decisions: ChatDecision[]): string[] {
	const accountIds = decisions.flatMap((decision) => [decision.raisedByAccountId, decision.waitingOnAccountId, decision.closedByAccountId]);
	return [...new Set(accountIds.filter((accountId) => accountId !== null))];
}

/**
 * The decisions with who raised each, who it waits on and who closed it, the name of the room it was raised in and
 * the words of its message. People are named through the service role, as a message's author is.
 */
export async function nameDecisions(supabase: SupabaseClient, decisions: ChatDecision[], rooms: ChatRoom[]): Promise<ListedChatDecision[]> {
	const messageIds = [...new Set(decisions.map((decision) => decision.messageId))];
	const [accounts, wordsByMessage] = await Promise.all([
		getAccountsById(supabaseServiceClient(), accountsNamedBy(decisions)),
		readWordsOfMessages(supabase, messageIds)
	]);
	const nameOf = accountNameLookup(accounts);
	const roomNames = new Map(rooms.map((room) => [room.id, room.name]));
	return decisions.map((decision) => ({
		...decision,
		roomName: roomNames.get(decision.roomId) ?? roomNoLongerKnown,
		messageWords: wordsByMessage.get(decision.messageId) ?? '',
		raiserName: nameOf(decision.raisedByAccountId),
		waitingOnName: nameOf(decision.waitingOnAccountId),
		closerName: decision.closedByAccountId === null ? null : nameOf(decision.closedByAccountId)
	}));
}
