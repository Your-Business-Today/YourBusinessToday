import type { SupabaseClient } from '@supabase/supabase-js';
import { siteMessage, type MessageOrigin } from '$lib/data/conversationTurn';
import { subjectColumns, type ConversationSubject } from './conversationSubject';

export const longestMessageBody = 4000;

export async function postMessage(
	supabase: SupabaseClient,
	subject: ConversationSubject,
	authorAccountId: string,
	body: string,
	origin: MessageOrigin = siteMessage
): Promise<void> {
	const { error } = await supabase.from('conversation_messages').insert({
		...subjectColumns(subject),
		author_account_id: authorAccountId,
		body,
		posted_via: origin.postedVia,
		awaiting_account_id: origin.awaiting?.accountId ?? null,
		awaiting_kind: origin.awaiting?.kind ?? null
	});
	if (error) throw error;
}
