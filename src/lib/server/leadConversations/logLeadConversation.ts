import type { SupabaseClient } from '@supabase/supabase-js';
import type { LeadConversationLogged } from '$lib/data/leadConversationRules';

/** Keeps a checked conversation on its lead, recording who logged it. */
export async function logLeadConversation(
	supabase: SupabaseClient,
	conversation: LeadConversationLogged,
	loggedByAccountId: string
): Promise<void> {
	const { error } = await supabase.from('lead_conversations').insert({
		client_id: conversation.clientId,
		person_id: conversation.personId,
		held_by_account_id: conversation.heldByAccountId,
		held_on: conversation.heldOn,
		channel: conversation.channel,
		summary: conversation.summary,
		what_was_said: conversation.whatWasSaid,
		logged_by_account_id: loggedByAccountId
	});
	if (error) throw error;
}
