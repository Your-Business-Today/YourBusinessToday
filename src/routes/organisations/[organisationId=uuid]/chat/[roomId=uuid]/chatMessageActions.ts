import { fail } from '@sveltejs/kit';
import { postChatMessage } from '$lib/server/chat/postChatMessage';
import { grantChatFileUpload } from '$lib/server/chat/grantChatFileUpload';
import { postedViaChannels } from '$lib/data/conversationTurn';
import { requireChatRoomKeeper } from '$lib/server/chat/requireChatRoomKeeper';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { refusedStatus } from '../chatRoomActions';
import type { Actions } from './$types';

export const chatMessageActions = {
	postMessage: async ({ locals, params, request }) => {
		const keeper = await requireChatRoomKeeper({ locals, params });
		const author = { ...keeper, postedVia: postedViaChannels.site };
		const formData = Object.fromEntries(await request.formData());
		const posted = await postChatMessage(supabaseServiceClient(), author, params.roomId, formData);
		if (typeof posted === 'string') return fail(refusedStatus, { message: posted });
		return { message: 'Said.' };
	},
	grantChatFile: async ({ locals, params, request }) => {
		const sender = await requireChatRoomKeeper({ locals, params });
		const formData = Object.fromEntries(await request.formData());
		const granted = await grantChatFileUpload(supabaseServiceClient(), sender, params.roomId, formData);
		if (typeof granted === 'string') return fail(refusedStatus, { message: granted });
		return granted;
	}
} satisfies Actions;
