import { readRoomsOpeningTheTemplates } from '$lib/server/chat/seedTemplateRooms';
import { chatRoomTree, topLevelRooms } from '$lib/data/chat/chatRoomTree';
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
		listedRooms: chatRoomTree(rooms),
		parentChoices: topLevelRooms(rooms)
	};
};
