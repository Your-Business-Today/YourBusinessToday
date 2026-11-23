import { catchUpOf, unreadMessagesOf, type ChatCatchUp } from '$lib/data/chat/chatCatchUp';
import { messagesIn } from '$lib/data/chat/chatRoomFlow';
import { findLatestSummaryOfRoom } from './findLatestChatSummary';
import type { ChatRoomFlowEntry } from './readChatFlowOfRoom';
import type { ChatRoomKeeper } from './chatRoomRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * What the room shows the reader above it as they come back: null when nothing in the room was new to them as the page
 * opened, before it marked the room read; otherwise the latest catch-up, if one was written, and what it misses.
 */
export async function readCatchUpForReader(
	supabase: SupabaseClient,
	reader: ChatRoomKeeper,
	roomId: string,
	flow: ChatRoomFlowEntry[],
	readUpTo: string | null
): Promise<ChatCatchUp | null> {
	const unread = unreadMessagesOf(messagesIn(flow), reader.accountId, readUpTo);
	if (unread.length === 0) return null;
	const summary = await findLatestSummaryOfRoom(supabase, roomId);
	return catchUpOf(unread, summary);
}
