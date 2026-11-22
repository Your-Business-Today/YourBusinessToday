import { fail } from '@sveltejs/kit';
import { postChatMessage } from '$lib/server/chat/postChatMessage';
import { requireChatRoomKeeper } from '$lib/server/chat/requireChatRoomKeeper';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { refusedStatus } from '../chatRoomActions';
import type { Actions } from './$types';

export const chatMessageActions = {
	postMessage: async ({ locals, params, request }) => {
		const author = await requireChatRoomKeeper({ locals, params });
		const formData = Object.fromEntries(await request.formData());
		const posted = await postChatMessage(supabaseServiceClient(), author, params.roomId, formData);
		if (typeof posted === 'string') return fail(refusedStatus, { message: posted });
		return { message: 'Said.' };
	}
} satisfies Actions;
