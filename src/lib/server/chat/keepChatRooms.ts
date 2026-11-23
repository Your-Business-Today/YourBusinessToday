import { validateChatRoomFields } from '$lib/data/chat/validateChatRoomFields';
import { archiveRefusal, changeRefusal, parentRefusal } from '$lib/data/chat/chatRoomPlacement';
import { validateRecordId } from '$lib/data/isUuid';
import { trimmedText } from '$lib/data/trimmedText';
import { readChatRooms } from './readChatRooms';
import { chatRoomColumns, chatRoomOf, chatRoomsTable, uniqueViolation, type ChatRoomKeeper, type ChatRoomRow } from './chatRoomRecord';
import type { ChatRoom, ChatRoomFields } from '$lib/data/chat/chatRoomRules';
import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';

type RoomWriteAnswer = { data: unknown; error: PostgrestError | null };

function nameTaken(fields: ChatRoomFields): string {
	return `A room called ${fields.name} already sits there; give it another name.`;
}

function roomWritten({ data, error }: RoomWriteAnswer, fields: ChatRoomFields): ChatRoom | string {
	if (error?.code === uniqueViolation) return nameTaken(fields);
	if (error !== null) throw error;
	return chatRoomOf(data as ChatRoomRow);
}

function columnsOf(fields: ChatRoomFields) {
	return {
		name: fields.name,
		purpose: fields.purpose,
		parent_room_id: fields.parentRoomId
	};
}

/** Adds the room once its every field fits its column and it sits where a room may, or says why not. */
export async function createChatRoom(supabase: SupabaseClient, keeper: ChatRoomKeeper, input: Record<string, unknown>): Promise<ChatRoom | string> {
	const fields = validateChatRoomFields(input);
	if (typeof fields === 'string') return fields;
	const rooms = await readChatRooms(supabase, keeper.organisationId);
	const refusal = parentRefusal(rooms, fields.parentRoomId);
	if (refusal !== null) return refusal;
	const row = {
		organisation_id: keeper.organisationId,
		created_by: keeper.accountId,
		...columnsOf(fields)
	};
	const written = await supabase.from(chatRoomsTable).insert(row).select(chatRoomColumns).single();
	return roomWritten(written, fields);
}

/** Renames the room, says again what it is for, or puts it under another room, or says why not. */
export async function changeChatRoom(supabase: SupabaseClient, organisationId: string, input: Record<string, unknown>): Promise<ChatRoom | string> {
	const roomId = trimmedText(input.roomId);
	const idRefusal = validateRecordId('room', roomId);
	if (idRefusal !== null) return idRefusal;
	const fields = validateChatRoomFields(input);
	if (typeof fields === 'string') return fields;
	const rooms = await readChatRooms(supabase, organisationId);
	const refusal = changeRefusal(rooms, roomId, fields);
	if (refusal !== null) return refusal;
	const written = await supabase
		.from(chatRoomsTable)
		.update(columnsOf(fields))
		.eq('organisation_id', organisationId)
		.eq('id', roomId)
		.select(chatRoomColumns)
		.single();
	return roomWritten(written, fields);
}

/** Archives the room alone, never a room beneath it, or says why it stays. */
export async function archiveChatRoom(supabase: SupabaseClient, organisationId: string, roomId: string): Promise<ChatRoom | string> {
	const idRefusal = validateRecordId('room', roomId);
	if (idRefusal !== null) return idRefusal;
	const rooms = await readChatRooms(supabase, organisationId);
	const refusal = archiveRefusal(rooms, roomId);
	if (refusal !== null) return refusal;
	const { data, error } = await supabase
		.from(chatRoomsTable)
		.update({ archived_at: new Date().toISOString() })
		.eq('organisation_id', organisationId)
		.eq('id', roomId)
		.select(chatRoomColumns)
		.single();
	if (error !== null) throw error;
	return chatRoomOf(data as unknown as ChatRoomRow);
}
