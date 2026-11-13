import { fail } from '@sveltejs/kit';
import { logLeadConversation } from '$lib/server/leadConversations/logLeadConversation';
import { requireStaff } from '$lib/server/auth/requireStaff';
import { validateLeadConversation } from '$lib/server/leadConversations/validateLeadConversation';
import { validateRecordId } from '$lib/data/isUuid';
import type { Actions } from './$types';

const badRequest = 400;

export const leadConversationActions: Actions = {
	logConversation: async ({ locals, params, request }) => {
		const user = await requireStaff(locals);
		const formData = await request.formData();
		const heldByAccountId = String(formData.get('heldBy') ?? '').trim();
		const heldByRefusal = validateRecordId('heldBy', heldByAccountId);
		if (heldByRefusal !== null) return fail(badRequest, { message: 'Say who on our side had the conversation.' });
		const fields = { ...Object.fromEntries(formData), clientId: params.clientId };
		const conversation = validateLeadConversation(fields, heldByAccountId);
		if (typeof conversation === 'string') return fail(badRequest, { message: conversation });
		await logLeadConversation(locals.supabase, conversation, user.id);
		return { message: 'Conversation logged.' };
	}
};
