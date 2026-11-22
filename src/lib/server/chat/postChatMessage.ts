import { postingRefusal } from '$lib/data/chat/chatRoomPosting';
import { validateChatMessage, type ChatMessageGiven } from '$lib/data/chat/validateChatMessage';
import { readChatRooms } from './readChatRooms';
import { markChatRoomRead } from './markChatRoomRead';
import { checkSentChatFiles } from './checkSentChatFiles';
import { writeMessageWithFiles } from './writeMessageWithFiles';
import { chatMessageColumns, chatMessageOf, chatMessagesTable, type ChatMessageRow } from './chatMessageRecord';
import type { ChatMessage } from '$lib/data/chat/chatMessageRules';
import type { PostedVia } from '$lib/data/conversationTurn';
import type { ChatRoomKeeper } from './chatRoomRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Who says it, in whose organisation's chat, and whether they say it on the site or through their own Claude. */
export type ChatAuthor = ChatRoomKeeper & { postedVia: PostedVia };

async function writeWords(serviceSupabase: SupabaseClient, author: ChatAuthor, roomId: string, body: string): Promise<ChatMessage> {
	const row = { organisation_id: author.organisationId, room_id: roomId, author_account_id: author.accountId, body, posted_via: author.postedVia };
	const { data, error } = await serviceSupabase.from(chatMessagesTable).insert(row).select(chatMessageColumns).single();
	if (error !== null) throw error;
	return chatMessageOf(data as ChatMessageRow);
}

async function writeMessage(serviceSupabase: SupabaseClient, author: ChatAuthor, roomId: string, given: ChatMessageGiven): Promise<ChatMessage | string> {
	const { body, files } = given;
	if (files.length === 0) return writeWords(serviceSupabase, author, roomId, body);
	const arrived = await checkSentChatFiles(serviceSupabase, author, files);
	if (typeof arrived === 'string') return arrived;
	return writeMessageWithFiles(serviceSupabase, author, roomId, { body, files: arrived });
}

/**
 * Says it in the room once the words fit their column, every file sent for it has arrived and fits the rules as
 * storage holds it, there are words or at least one file, and the room is open; moves the author's place to now.
 * Or says why not.
 */
export async function postChatMessage(serviceSupabase: SupabaseClient, author: ChatAuthor, roomId: string, input: Record<string, unknown>): Promise<ChatMessage | string> {
	const given = validateChatMessage(input);
	if (typeof given === 'string') return given;
	const rooms = await readChatRooms(serviceSupabase, author.organisationId);
	const refusal = postingRefusal(rooms.find((room) => room.id === roomId));
	if (refusal !== null) return refusal;
	const posted = await writeMessage(serviceSupabase, author, roomId, given);
	if (typeof posted === 'string') return posted;
	await markChatRoomRead(serviceSupabase, author.accountId, roomId);
	return posted;
}
