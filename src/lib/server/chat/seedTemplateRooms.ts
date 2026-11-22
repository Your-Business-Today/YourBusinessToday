import { templateRooms, type ChatRoom } from '$lib/data/chat/chatRoomRules';
import { needsTemplateRooms } from '$lib/data/chat/chatTemplateRooms';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { readChatRooms } from './readChatRooms';
import { chatRoomsTable, uniqueViolation, type ChatRoomKeeper } from './chatRoomRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Opens the template rooms in one insert. Two people opening the chat at once both try; the unique rules let one
 * through, and the other's duplicate means the rooms are already there.
 */
export async function seedTemplateRooms(supabase: SupabaseClient, keeper: ChatRoomKeeper): Promise<void> {
	const rows = templateRooms.map(({ name, purpose, isGeneral }) => ({
		organisation_id: keeper.organisationId,
		created_by: keeper.accountId,
		name,
		purpose,
		is_general: isGeneral
	}));
	const { error } = await supabase.from(chatRoomsTable).insert(rows);
	if (error?.code === uniqueViolation) return;
	if (error !== null) throw error;
}

/** The organisation's rooms, read as the visitor reads them, once the template rooms are open on a first visit. */
export async function readRoomsOpeningTheTemplates(supabase: SupabaseClient, keeper: ChatRoomKeeper): Promise<ChatRoom[]> {
	const keptRooms = await readChatRooms(supabase, keeper.organisationId);
	if (!needsTemplateRooms(keptRooms)) return keptRooms;
	await seedTemplateRooms(supabaseServiceClient(), keeper);
	return readChatRooms(supabase, keeper.organisationId);
}
