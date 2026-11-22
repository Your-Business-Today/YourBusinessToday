import { fail, type RequestEvent } from '@sveltejs/kit';
import { requireOrganisationModule } from '$lib/server/auth/requireOrganisationModule';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { archiveChatRoom, changeChatRoom, createChatRoom } from '$lib/server/chat/keepChatRooms';
import { trimmedText } from '$lib/data/trimmedText';
import type { ChatRoomKeeper } from '$lib/server/chat/chatRoomRecord';
import type { Actions } from './$types';

const refusedStatus = 400;

async function requireChatRoomKeeper({ locals, params }: Pick<RequestEvent, 'locals' | 'params'>): Promise<ChatRoomKeeper> {
	const organisationId = params.organisationId ?? '';
	const { user } = await requireOrganisationModule(locals, organisationId, 'chat');
	return { organisationId, accountId: user.id };
}

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
