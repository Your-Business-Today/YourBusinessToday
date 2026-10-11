import type { SupabaseClient } from '@supabase/supabase-js';

export async function setOrganisationManager(
	supabase: SupabaseClient,
	organisationId: string,
	accountId: string,
	isManager: boolean
): Promise<void> {
	const { error } = await supabase
		.from('organisation_members')
		.update({ is_manager: isManager })
		.eq('organisation_id', organisationId)
		.eq('account_id', accountId);
	if (error) throw error;
}
