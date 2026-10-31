import type { SupabaseClient } from '@supabase/supabase-js';
import { defaultAskKind, type AskKind } from '$lib/data/askKind';
import { siteMessage, type HandOff, type MessageOrigin } from '$lib/data/conversationTurn';
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
		...handOffColumns(origin.awaiting, origin.askKind ?? defaultAskKind)
	});
	if (error) throw error;
}

function handOffColumns(awaiting: HandOff | null, askKind: AskKind) {
	if (awaiting === null) return { awaiting_account_id: null, awaiting_kind: null, ask_kind: null };
	return { awaiting_account_id: awaiting.accountId, awaiting_kind: awaiting.kind, ask_kind: askKind };
}
