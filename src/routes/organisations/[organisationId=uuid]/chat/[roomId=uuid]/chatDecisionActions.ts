import { fail } from '@sveltejs/kit';
import { closeChatDecision } from '$lib/server/chat/closeChatDecision';
import { raiseChatDecision } from '$lib/server/chat/raiseChatDecision';
import { postedViaChannels } from '$lib/data/conversationTurn';
import { requireChatRoomKeeper } from '$lib/server/chat/requireChatRoomKeeper';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { refusedStatus } from '../chatRoomActions';
import type { Actions } from './$types';

export const chatDecisionActions = {
	raiseDecision: async ({ locals, params, request }) => {
		const keeper = await requireChatRoomKeeper({ locals, params });
		const raiser = { ...keeper, postedVia: postedViaChannels.site };
		const formData = Object.fromEntries(await request.formData());
		const raised = await raiseChatDecision(supabaseServiceClient(), raiser, params.roomId, formData);
		if (typeof raised === 'string') return fail(refusedStatus, { message: raised });
		return { message: 'The decision is raised.' };
	},
	closeDecision: async ({ locals, params, request }) => {
		const closer = await requireChatRoomKeeper({ locals, params });
		const formData = Object.fromEntries(await request.formData());
		const closed = await closeChatDecision(supabaseServiceClient(), closer, formData);
		if (typeof closed === 'string') return fail(refusedStatus, { message: closed });
		return { message: 'The decision is closed.' };
	}
} satisfies Actions;
