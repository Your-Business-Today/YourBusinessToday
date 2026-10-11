import { getMemberProjectIds } from '$lib/server/members/getMemberProjectIds';
import { getMembershipsForAccount } from '$lib/server/organisations/getMembershipsOfOrganisations';
import { getOwnedProjectIds } from '$lib/server/projects/getOwnedProjectIds';
import type { OrganisationMembership } from '$lib/data/organisationAccess';
import type { SupabaseClient } from '@supabase/supabase-js';

export type AccountStanding = {
	accountId: string;
	email: string;
	isAdmin: boolean;
	isStaff: boolean;
	ownedProjectIds: string[];
	memberProjectIds: string[];
	organisationMemberships: OrganisationMembership[];
};

export async function resolveAccountStanding(
	supabase: SupabaseClient,
	accountId: string
): Promise<AccountStanding | null> {
	const { data, error } = await supabase
		.from('profiles')
		.select('email, is_staff, is_admin, is_restricted')
		.eq('id', accountId)
		.maybeSingle();
	if (error) throw error;
	if (data === null || data.is_restricted === true) return null;
	return {
		accountId,
		email: data.email ?? '',
		isAdmin: data.is_admin === true,
		isStaff: data.is_staff === true || data.is_admin === true,
		ownedProjectIds: await getOwnedProjectIds(supabase, accountId),
		memberProjectIds: await getMemberProjectIds(supabase, accountId),
		organisationMemberships: await getMembershipsForAccount(supabase, accountId)
	};
}
