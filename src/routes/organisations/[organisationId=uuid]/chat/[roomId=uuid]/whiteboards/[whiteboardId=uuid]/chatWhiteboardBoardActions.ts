import { fail } from '@sveltejs/kit';
import { saveChatWhiteboard } from '$lib/server/chat/saveChatWhiteboard';
import { requireChatRoomKeeper } from '$lib/server/chat/requireChatRoomKeeper';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { refusedStatus } from '../../../chatRoomActions';
import type { Actions } from './$types';

export const chatWhiteboardBoardActions = {
	saveWhiteboard: async ({ locals, params, request }) => {
		const saver = await requireChatRoomKeeper({ locals, params });
		const asked = { organisationId: saver.organisationId, roomId: params.roomId, whiteboardId: params.whiteboardId };
		const formData = Object.fromEntries(await request.formData());
		const saved = await saveChatWhiteboard(supabaseServiceClient(), saver, asked, formData);
		if (typeof saved === 'string') return fail(refusedStatus, { message: saved });
		return { message: 'Saved.', updatedAt: saved.updatedAt, lastSavedByName: saved.lastSavedByName };
	}
} satisfies Actions;
