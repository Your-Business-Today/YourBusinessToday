import { fail } from '@sveltejs/kit';
import { requireChatRoomKeeper } from '$lib/server/chat/requireChatRoomKeeper';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { archiveChatRoom, changeChatRoom, createChatRoom } from '$lib/server/chat/keepChatRooms';
import { trimmedText } from '$lib/data/trimmedText';
import type { Actions } from './$types';

export const refusedStatus = 400;

export const chatRoomActions = {
	createRoom: async ({ locals, params, request }) => {
		const keeper = await requireChatRoomKeeper({ locals, params });
		const formData = Object.fromEntries(await request.formData());
		const created = await createChatRoom(supabaseServiceClient(), keeper, formData);
		if (typeof created === 'string') return fail(refusedStatus, { message: created });
		return { message: `${created.name} is open.` };
	},
	changeRoom: async ({ locals, params, request }) => {
		const { organisationId } = await requireChatRoomKeeper({ locals, params });
		const formData = Object.fromEntries(await request.formData());
		const changed = await changeChatRoom(supabaseServiceClient(), organisationId, formData);
		if (typeof changed === 'string') return fail(refusedStatus, { message: changed });
		return { message: `${changed.name} is saved.` };
	},
	archiveRoom: async ({ locals, params, request }) => {
		const { organisationId } = await requireChatRoomKeeper({ locals, params });
		const formData = await request.formData();
		const archived = await archiveChatRoom(supabaseServiceClient(), organisationId, trimmedText(formData.get('roomId')));
		if (typeof archived === 'string') return fail(refusedStatus, { message: archived });
		return { message: `${archived.name} is archived.` };
	}
} satisfies Actions;
