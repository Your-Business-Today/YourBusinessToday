import { inviteWindowStart } from '$lib/server/email/inviteAllowance';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Only invitations to the project itself count; the rows an organisation grants are counted on the organisation. */
export async function countProjectInvitesThisHour(
	supabase: SupabaseClient,
	inviterAccountId: string
): Promise<number> {
	const { count, error } = await supabase
		.from('project_members')
		.select('project_id', { count: 'exact', head: true })
		.eq('added_by', inviterAccountId)
		.is('via_organisation_id', null)
		.gte('created_at', inviteWindowStart());
	if (error !== null) throw error;
	return count ?? 0;
}
