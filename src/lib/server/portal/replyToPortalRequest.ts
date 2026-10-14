import { isOwnPortalRequest } from './getPortalRequests';
import { postMessage } from '$lib/server/conversations/postMessage';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { PortalReply } from './validatePortalRequest';
import type { Refusal } from './portalFormReading';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Posts the contact's reply on a request they raised; the request is checked on their own account first. */
export async function replyToPortalRequest(
	supabase: SupabaseClient,
	accountId: string,
	reply: PortalReply
): Promise<Refusal | null> {
	const isTheirs = await isOwnPortalRequest(supabase, reply.taskId);
	if (!isTheirs) return { refusal: 'That is not one of your requests.' };
	await postMessage(supabaseServiceClient(), { taskId: reply.taskId }, accountId, reply.body);
	return null;
}
