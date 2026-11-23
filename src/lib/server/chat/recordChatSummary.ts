import { postingRefusal } from '$lib/data/chat/chatRoomPosting';
import { coverageRefusal, validateChatSummary } from '$lib/data/chat/validateChatSummary';
import { readChatRooms } from './readChatRooms';
import { chatMessagesTable } from './chatMessageRecord';
import { chatSummariesTable, chatSummaryColumns, chatSummaryOf, type ChatSummaryRow } from './chatSummaryRecord';
import type { ChatSummary, ChatSummaryGiven } from '$lib/data/chat/chatSummaryRules';
import type { ChatAuthor } from './postChatMessage';
import type { SupabaseClient } from '@supabase/supabase-js';

type MessageMomentRow = { created_at: string };

/** When the room's latest message was said, or null when nothing has been said in it. */
async function findLatestMomentInRoom(serviceSupabase: SupabaseClient, roomId: string): Promise<string | null> {
	const { data, error } = await serviceSupabase
		.from(chatMessagesTable)
		.select('created_at')
		.eq('room_id', roomId)
		.order('created_at', { ascending: false })
		.limit(1)
		.maybeSingle();
	if (error !== null) throw error;
	return (data as MessageMomentRow | null)?.created_at ?? null;
}

async function writeSummary(serviceSupabase: SupabaseClient, writer: ChatAuthor, roomId: string, given: ChatSummaryGiven): Promise<ChatSummary> {
	const row = {
		organisation_id: writer.organisationId,
		room_id: roomId,
		covers_up_to: given.coversUpTo,
		words: given.words,
		written_by_account_id: writer.accountId,
		written_via: writer.postedVia
	};
	const { data, error } = await serviceSupabase.from(chatSummariesTable).insert(row).select(chatSummaryColumns).single();
	if (error !== null) throw error;
	return chatSummaryOf(data as ChatSummaryRow);
}

/**
 * Saves a catch-up of the room for everyone in it, once its words fit their column, the room is one of the
 * organisation's and open, and the moment it covers up to is neither in the future nor later than the room's latest
 * message. Or says why not. Nothing is marked read and no one is told.
 */
export async function recordChatSummary(
	serviceSupabase: SupabaseClient,
	writer: ChatAuthor,
	roomId: string,
	input: Record<string, unknown>
): Promise<ChatSummary | string> {
	const given = validateChatSummary(input);
	if (typeof given === 'string') return given;
	const rooms = await readChatRooms(serviceSupabase, writer.organisationId);
	const refusal = postingRefusal(rooms.find((room) => room.id === roomId));
	if (refusal !== null) return refusal;
	const latestMessageAt = await findLatestMomentInRoom(serviceSupabase, roomId);
	const uncovered = coverageRefusal(given.coversUpTo, latestMessageAt, Date.now());
	if (uncovered !== null) return uncovered;
	return writeSummary(serviceSupabase, writer, roomId, given);
}
