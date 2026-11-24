import { error } from '@sveltejs/kit';
import { readChatRooms } from '$lib/server/chat/readChatRooms';
import { openWhiteboard } from '$lib/server/chat/readChatWhiteboard';
import { chatWhiteboardBoardActions } from './chatWhiteboardBoardActions';
import type { PageServerLoad } from './$types';

const notFoundStatus = 404;
const noSuchRoom = 'This organisation has no chat room of that id';
const noSuchWhiteboard = 'This room has no whiteboard of that id';

export const load: PageServerLoad = async ({ locals, params, parent }) => {
	await parent();
	const rooms = await readChatRooms(locals.supabase, params.organisationId);
	const room = rooms.find((candidate) => candidate.id === params.roomId);
	if (room === undefined) error(notFoundStatus, noSuchRoom);
	const asked = { organisationId: params.organisationId, roomId: room.id, whiteboardId: params.whiteboardId };
	const board = await openWhiteboard(locals.supabase, asked);
	if (board === null) error(notFoundStatus, noSuchWhiteboard);
	return { room, board };
};

export const actions = chatWhiteboardBoardActions;
