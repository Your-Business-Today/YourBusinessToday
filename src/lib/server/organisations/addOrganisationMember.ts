import type { SupabaseClient } from '@supabase/supabase-js';
import { syncOrganisationAccess } from './syncOrganisationAccess';

export type NewMembership = {
	organisationId: string;
	accountId: string;
	isManager: boolean;
	addedBy: string;
};

/** Puts someone on an organisation and gives them every project under it at once. */
export async function addOrganisationMember(supabase: SupabaseClient, membership: NewMembership): Promise<void> {
	const { error } = await supabase.from('organisation_members').upsert(
		{
			organisation_id: membership.organisationId,
			account_id: membership.accountId,
			is_manager: membership.isManager,
			added_by: membership.addedBy
		},
		{ onConflict: 'organisation_id,account_id', ignoreDuplicates: true }
	);
	if (error) throw error;
	await syncOrganisationAccess(membership.organisationId);
}
