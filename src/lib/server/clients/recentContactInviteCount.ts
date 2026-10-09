import { inviteWindowStart } from '$lib/server/email/inviteAllowance';
import type { SupabaseClient } from '@supabase/supabase-js';

const contactInvitedKind = 'contact_invited';

/**
 * Each invitation leaves a contact_invited event naming who sent it, so the
 * events are the per-person record where client_contacts.invited_at is not.
 */
export async function countContactInvitesThisHour(
	supabase: SupabaseClient,
	actorAccountId: string
): Promise<number> {
	const { count, error } = await supabase
		.from('client_events')
		.select('id', { count: 'exact', head: true })
		.eq('kind', contactInvitedKind)
		.eq('actor_account_id', actorAccountId)
		.gte('created_at', inviteWindowStart());
	if (error !== null) throw error;
	return count ?? 0;
}
