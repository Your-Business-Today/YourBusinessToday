import { error } from '@sveltejs/kit';
import { chatRoomDependency } from '$lib/data/chat/chatMessageRules';
import { listChatRoomsWithUnread } from '$lib/server/chat/readChatUnreadCounts';
import { markChatRoomRead } from '$lib/server/chat/markChatRoomRead';
import { readChatFlowOfRoom } from '$lib/server/chat/readChatFlowOfRoom';
import { placeInRoom } from '$lib/server/chat/readChatRoomAsAsked';
import { readCatchUpForReader } from '$lib/server/chat/readCatchUpForReader';
import { readRoomsOpeningTheTemplates } from '$lib/server/chat/seedTemplateRooms';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { chatMessageActions } from './chatMessageActions';
import { chatMoveActions } from './chatMoveActions';
import type { ChatRoomKeeper } from '$lib/server/chat/chatRoomRecord';
import type { PageServerLoad } from './$types';

const noSuchRoom = 'This organisation has no chat room of that id';

/** The one write the room's load makes: the reader has now read the room up to this moment. */
async function recordRoomOpened(reader: ChatRoomKeeper, roomId: string): Promise<void> {
	await markChatRoomRead(supabaseServiceClient(), reader.accountId, roomId);
}

export const load: PageServerLoad = async ({ locals, params, parent, depends }) => {
	depends(chatRoomDependency);
	const { chatAccountId } = await parent();
	const reader = { organisationId: params.organisationId, accountId: chatAccountId };
	const rooms = await readRoomsOpeningTheTemplates(locals.supabase, reader);
	const room = rooms.find((candidate) => candidate.id === params.roomId);
	if (room === undefined) error(404, noSuchRoom);
	const readUpToBeforeOpening = await placeInRoom(supabaseServiceClient(), reader, room.id);
	await recordRoomOpened(reader, room.id);
	const [flow, listedRooms] = await Promise.all([
		readChatFlowOfRoom(locals.supabase, room.id, rooms),
		listChatRoomsWithUnread(locals.supabase, reader.organisationId, rooms)
	]);
	const catchUp = await readCatchUpForReader(locals.supabase, reader, room.id, flow, readUpToBeforeOpening);
	return { room, flow, listedRooms, catchUp };
};

export const actions = { ...chatMessageActions, ...chatMoveActions };
