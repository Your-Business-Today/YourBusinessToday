import { inviteWindowStart } from '$lib/server/email/inviteAllowance';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function countOrganisationInvitesThisHour(
	supabase: SupabaseClient,
	inviterAccountId: string
): Promise<number> {
	const { count, error } = await supabase
		.from('organisation_members')
		.select('organisation_id', { count: 'exact', head: true })
		.eq('added_by', inviterAccountId)
		.gte('created_at', inviteWindowStart());
	if (error !== null) throw error;
	return count ?? 0;
}
