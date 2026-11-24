import { fail, redirect } from '@sveltejs/kit';
import { createChatWhiteboard } from '$lib/server/chat/createChatWhiteboard';
import { requireChatRoomKeeper } from '$lib/server/chat/requireChatRoomKeeper';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { chatWhiteboardPath } from '$lib/data/chat/chatPaths';
import { refusedStatus } from '../chatRoomActions';
import type { Actions } from './$types';

const seeOtherStatus = 303;

export const chatWhiteboardActions = {
	createWhiteboard: async ({ locals, params, request }) => {
		const starter = await requireChatRoomKeeper({ locals, params });
		const formData = Object.fromEntries(await request.formData());
		const created = await createChatWhiteboard(supabaseServiceClient(), starter, params.roomId, formData);
		if (typeof created === 'string') return fail(refusedStatus, { message: created });
		redirect(seeOtherStatus, chatWhiteboardPath(params.organisationId, params.roomId, created.id));
	}
} satisfies Actions;
