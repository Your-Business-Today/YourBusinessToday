import { postingRefusal } from '$lib/data/chat/chatRoomPosting';
import { validateChatMessageBody } from '$lib/data/chat/validateChatMessageBody';
import { readChatRooms } from './readChatRooms';
import { markChatRoomRead } from './markChatRoomRead';
import { chatMessageColumns, chatMessageOf, chatMessagesTable, type ChatMessageRow } from './chatMessageRecord';
import type { ChatMessage } from '$lib/data/chat/chatMessageRules';
import type { PostedVia } from '$lib/data/conversationTurn';
import type { ChatRoomKeeper } from './chatRoomRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Who says it, in whose organisation's chat, and whether they say it on the site or through their own Claude. */
export type ChatAuthor = ChatRoomKeeper & { postedVia: PostedVia };

/** Says the words in the room once they fit the column and the room is open, moving the author's place to now, or says why not. */
export async function postChatMessage(serviceSupabase: SupabaseClient, author: ChatAuthor, roomId: string, input: Record<string, unknown>): Promise<ChatMessage | string> {
	const fields = validateChatMessageBody(input);
	if (typeof fields === 'string') return fields;
	const rooms = await readChatRooms(serviceSupabase, author.organisationId);
	const refusal = postingRefusal(rooms.find((room) => room.id === roomId));
	if (refusal !== null) return refusal;
	const row = {
		organisation_id: author.organisationId,
		room_id: roomId,
		author_account_id: author.accountId,
		body: fields.body,
		posted_via: author.postedVia
	};
	const { data, error } = await serviceSupabase.from(chatMessagesTable).insert(row).select(chatMessageColumns).single();
	if (error !== null) throw error;
	await markChatRoomRead(serviceSupabase, author.accountId, roomId);
	return chatMessageOf(data as ChatMessageRow);
}
