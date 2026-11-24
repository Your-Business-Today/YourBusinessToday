import { readRoomsOpeningTheTemplates } from '$lib/server/chat/seedTemplateRooms';
import { listChatRoomsWithUnread } from '$lib/server/chat/readChatUnreadCounts';
import { listDecisionsOfOrganisation } from '$lib/server/chat/listChatDecisions';
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
	const [listedRooms, decisions] = await Promise.all([
		listChatRoomsWithUnread(locals.supabase, organisationId, rooms),
		listDecisionsOfOrganisation(locals.supabase, organisationId, rooms)
	]);
	return { listedRooms, decisions, parentChoices: topLevelRooms(rooms) };
};

export const actions = chatRoomActions;
