import { chatDecisionLimits, type ChatDecision, type ListedChatDecision } from '$lib/data/chat/chatDecisionRules';
import { decisionsOpenFirst } from '$lib/data/chat/chatDecisionOrder';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { chatDecisionColumns, chatDecisionOf, chatDecisionsTable, type ChatDecisionRow } from './chatDecisionRecord';
import { nameDecisions } from './nameChatDecisions';
import type { ChatRoom } from '$lib/data/chat/chatRoomRules';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Which decisions are asked for: those raised in one room, or every one of the organisation. */
type DecisionsAsked = { column: 'room_id' | 'organisation_id'; value: string };

/** The latest decisions asked for, read as the reader reads them; none while migration 0277 has not run. */
async function readDecisionRows(supabase: SupabaseClient, asked: DecisionsAsked): Promise<ChatDecision[]> {
	const { data, error } = await supabase
		.from(chatDecisionsTable)
		.select(chatDecisionColumns)
		.eq(asked.column, asked.value)
		.order('created_at', { ascending: false })
		.limit(chatDecisionLimits.latestDecisionsShown);
	if (isSchemaNotYetMigrated(error)) return [];
	if (error !== null) throw error;
	return (data as ChatDecisionRow[]).map(chatDecisionOf);
}

async function listDecisions(supabase: SupabaseClient, asked: DecisionsAsked, rooms: ChatRoom[]): Promise<ListedChatDecision[]> {
	const decisions = await readDecisionRows(supabase, asked);
	const named = await nameDecisions(supabase, decisions, rooms);
	return decisionsOpenFirst(named);
}

/** The decisions raised in the room, open ones first, with the people named and the words of each one's message. */
export async function listDecisionsOfRoom(supabase: SupabaseClient, roomId: string, rooms: ChatRoom[]): Promise<ListedChatDecision[]> {
	return listDecisions(supabase, { column: 'room_id', value: roomId }, rooms);
}

/** Every decision of the organisation across its rooms, open ones first, each with its room's name. */
export async function listDecisionsOfOrganisation(supabase: SupabaseClient, organisationId: string, rooms: ChatRoom[]): Promise<ListedChatDecision[]> {
	return listDecisions(supabase, { column: 'organisation_id', value: organisationId }, rooms);
}
