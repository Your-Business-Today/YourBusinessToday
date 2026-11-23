import { chatDecisionRefusals, type ChatDecision, type ChatDecisionRaising } from '$lib/data/chat/chatDecisionRules';
import { raisingRefusal, validateDecisionRaising } from '$lib/data/chat/validateChatDecision';
import { findOrganisationMember, getMembersOfOrganisation } from '$lib/server/organisations/getMembersOfOrganisation';
import { readChatRooms } from './readChatRooms';
import { chatMessagesTable } from './chatMessageRecord';
import { chatDecisionColumns, chatDecisionOf, chatDecisionsTable, type ChatDecisionRow } from './chatDecisionRecord';
import type { ChatAuthor } from './postChatMessage';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Whether the message is one of the organisation's and is in the room now. */
async function isMessageInRoom(serviceSupabase: SupabaseClient, raiser: ChatAuthor, roomId: string, messageId: string): Promise<boolean> {
	const { data, error } = await serviceSupabase
		.from(chatMessagesTable)
		.select('id')
		.eq('id', messageId)
		.eq('organisation_id', raiser.organisationId)
		.eq('room_id', roomId)
		.maybeSingle();
	if (error !== null) throw error;
	return data !== null;
}

/** The account of the person of the organisation the decision waits on, by id, email or name, or null. */
async function findPersonWaitedOn(serviceSupabase: SupabaseClient, organisationId: string, named: string): Promise<string | null> {
	const people = await getMembersOfOrganisation(serviceSupabase, organisationId);
	const person = findOrganisationMember(people, named);
	return person?.id ?? null;
}

async function writeDecision(
	serviceSupabase: SupabaseClient,
	raiser: ChatAuthor,
	roomId: string,
	raising: ChatDecisionRaising,
	waitingOnAccountId: string
): Promise<ChatDecision> {
	const row = {
		organisation_id: raiser.organisationId,
		room_id: roomId,
		message_id: raising.messageId,
		wording: raising.wording,
		raised_by_account_id: raiser.accountId,
		raised_via: raiser.postedVia,
		waiting_on_account_id: waitingOnAccountId
	};
	const { data, error } = await serviceSupabase.from(chatDecisionsTable).insert(row).select(chatDecisionColumns).single();
	if (error !== null) throw error;
	return chatDecisionOf(data as ChatDecisionRow);
}

/**
 * Raises a decision in the room from one of its messages, waiting on a person of the organisation, once the wording
 * fits its column, the room is one of the organisation's and open, the message is in that room now and the person is
 * on the organisation. Or says why not. Nothing is posted in the room, and no one is emailed.
 */
export async function raiseChatDecision(
	serviceSupabase: SupabaseClient,
	raiser: ChatAuthor,
	roomId: string,
	input: Record<string, unknown>
): Promise<ChatDecision | string> {
	const raising = validateDecisionRaising(input);
	if (typeof raising === 'string') return raising;
	const rooms = await readChatRooms(serviceSupabase, raiser.organisationId);
	const refusal = raisingRefusal(rooms.find((room) => room.id === roomId));
	if (refusal !== null) return refusal;
	const isInRoom = await isMessageInRoom(serviceSupabase, raiser, roomId, raising.messageId);
	if (!isInRoom) return chatDecisionRefusals.messageNotInRoom;
	const waitingOnAccountId = await findPersonWaitedOn(serviceSupabase, raiser.organisationId, raising.waitingOn);
	if (waitingOnAccountId === null) return chatDecisionRefusals.notAPerson;
	return writeDecision(serviceSupabase, raiser, roomId, raising, waitingOnAccountId);
}
