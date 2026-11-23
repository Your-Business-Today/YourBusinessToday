import { chatMessageLimits, type ChatMessage } from '$lib/data/chat/chatMessageRules';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { withAuthorNames, type Named } from '$lib/server/conversations/withAuthorNames';
import { chatMessageOf, roomMessageColumns, chatMessagesTable, type ChatMessageRow } from './chatMessageRecord';
import { readFilesOfMessages } from './readChatMessageFiles';
import type { SupabaseClient } from '@supabase/supabase-js';

export type NamedChatMessage = Named<ChatMessage>;

/** The room's latest messages, oldest first, read as the visitor reads them. */
async function readLatestMessageRows(supabase: SupabaseClient, roomId: string): Promise<ChatMessage[]> {
	const { data, error } = await supabase
		.from(chatMessagesTable)
		.select(roomMessageColumns)
		.eq('room_id', roomId)
		.order('created_at', { ascending: false })
		.limit(chatMessageLimits.latestMessagesShown);
	if (error !== null) throw error;
	return (data as ChatMessageRow[]).map(chatMessageOf).reverse();
}

/** The room's latest messages, each with the files it carries. */
async function readLatestMessages(supabase: SupabaseClient, roomId: string): Promise<ChatMessage[]> {
	const messages = await readLatestMessageRows(supabase, roomId);
	const filesByMessage = await readFilesOfMessages(supabase, messages.map((message) => message.id));
	return messages.map((message) => ({ ...message, files: filesByMessage.get(message.id) ?? [] }));
}

/**
 * The room's latest messages with who said each. The directory names only the people on a visitor's projects, and
 * everyone on the organisation talks in its rooms, so the authors are named through the service role once the
 * module gate has let the visitor in.
 */
export async function readChatMessages(supabase: SupabaseClient, roomId: string): Promise<NamedChatMessage[]> {
	const messages = await readLatestMessages(supabase, roomId);
	const authorIds = messages.map((message) => message.authorAccountId);
	const authors = await getAccountsById(supabaseServiceClient(), authorIds);
	return withAuthorNames(messages, authors);
}
