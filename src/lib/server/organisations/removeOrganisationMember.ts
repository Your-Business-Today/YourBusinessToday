import type { SupabaseClient } from '@supabase/supabase-js';
import { syncOrganisationAccess } from './syncOrganisationAccess';

/** Takes someone off an organisation; the projects it gave them go with it, a direct invitation stays. */
export async function removeOrganisationMember(
	supabase: SupabaseClient,
	organisationId: string,
	accountId: string
): Promise<void> {
	const { error } = await supabase
		.from('organisation_members')
		.delete()
		.eq('organisation_id', organisationId)
		.eq('account_id', accountId);
	if (error) throw error;
	await syncOrganisationAccess(organisationId);
}
