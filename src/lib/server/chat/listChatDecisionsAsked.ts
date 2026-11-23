import { chatDecisionLimits, type ChatDecisionListingAsked, type ChatDecisionStatus, type ListedChatDecision } from '$lib/data/chat/chatDecisionRules';
import { chatMessageRefusals } from '$lib/data/chat/chatMessageRules';
import { validateDecisionListing } from '$lib/data/chat/validateChatDecisionListing';
import { listDecisionsOfOrganisation, listDecisionsOfRoom } from './listChatDecisions';
import { readChatRooms } from './readChatRooms';
import type { ChatRoom } from '$lib/data/chat/chatRoomRules';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The decisions a listing gives, open first, with the room it was cut to, how many it left out and whether it reached the most read. */
export type ChatDecisionListing = {
	room: ChatRoom | null;
	status: ChatDecisionStatus | null;
	decisions: ListedChatDecision[];
	decisionsLeftOut: number;
	isAtMostRead: boolean;
};

const noneLeftOut = 0;

async function decisionsOfRoomOrOrganisation(supabase: SupabaseClient, organisationId: string, room: ChatRoom | null, rooms: ChatRoom[]) {
	if (room === null) return listDecisionsOfOrganisation(supabase, organisationId, rooms);
	return listDecisionsOfRoom(supabase, room.id, rooms);
}

function withStatus(decisions: ListedChatDecision[], status: ChatDecisionStatus | null): ListedChatDecision[] {
	if (status === null) return decisions;
	return decisions.filter((decision) => decision.status === status);
}

function listingOf(listed: ListedChatDecision[], room: ChatRoom | null, asked: ChatDecisionListingAsked): ChatDecisionListing {
	const matching = withStatus(listed, asked.status);
	const decisionsLeftOut = Math.max(noneLeftOut, matching.length - asked.limit);
	const isAtMostRead = listed.length === chatDecisionLimits.latestDecisionsShown;
	return { room, status: asked.status, decisions: matching.slice(0, asked.limit), decisionsLeftOut, isAtMostRead };
}

/**
 * The organisation's decisions as a listing asks for them, through the same reads the room and chat home make: one
 * room's, archived or not, or every room's, open first, cut to the status and the limit asked. Or why not.
 */
export async function listChatDecisionsAsked(
	supabase: SupabaseClient,
	organisationId: string,
	input: Record<string, unknown>
): Promise<ChatDecisionListing | string> {
	const asked = validateDecisionListing(input);
	if (typeof asked === 'string') return asked;
	const rooms = await readChatRooms(supabase, organisationId);
	const room = rooms.find((candidate) => candidate.id === asked.roomId) ?? null;
	const isRoomUnknown = asked.roomId !== null && room === null;
	if (isRoomUnknown) return chatMessageRefusals.noSuchRoom;
	const listed = await decisionsOfRoomOrOrganisation(supabase, organisationId, room, rooms);
	return listingOf(listed, room, asked);
}
