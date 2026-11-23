import { readRoomsOpeningTheTemplates } from '$lib/server/chat/seedTemplateRooms';
import { listChatRoomsWithUnread } from '$lib/server/chat/readChatUnreadCounts';
import { topLevelRooms } from '$lib/data/chat/chatRoomTree';
import { chatRoomActions } from './chatRoomActions';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, parent }) => {
	const { chatAccountId } = await parent();
	const organisationId = params.organisationId;
	const rooms = await readRoomsOpeningTheTemplates(locals.supabase, {
		organisationId,
		accountId: chatAccountId
	});
	return {
		listedRooms: await listChatRoomsWithUnread(locals.supabase, organisationId, rooms),
		parentChoices: topLevelRooms(rooms)
	};
};

export const actions = chatRoomActions;
