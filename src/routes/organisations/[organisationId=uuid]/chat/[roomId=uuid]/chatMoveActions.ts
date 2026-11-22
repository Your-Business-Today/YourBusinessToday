import { fail } from '@sveltejs/kit';
import { moveChatMessages } from '$lib/server/chat/moveChatMessages';
import { requireChatRoomKeeper } from '$lib/server/chat/requireChatRoomKeeper';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { refusedStatus } from '../chatRoomActions';
import type { Actions } from './$types';

export const chatMoveActions = {
	moveMessages: async ({ locals, params, request }) => {
		const mover = await requireChatRoomKeeper({ locals, params });
		const formData = await request.formData();
		const input = { messageIds: formData.getAll('messageId'), toRoomId: formData.get('toRoomId') };
		const moved = await moveChatMessages(supabaseServiceClient(), mover, params.roomId, input);
		if (typeof moved === 'string') return fail(refusedStatus, { message: moved });
		const { move, destination } = moved;
		return { message: `Moved ${move.messageCount} to ${destination.name}.` };
	}
} satisfies Actions;
