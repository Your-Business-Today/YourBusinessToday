import type { SupabaseClient } from '@supabase/supabase-js';
import type { OrganisationMembership } from '$lib/data/organisationAccess';

/** A membership row with who granted it, which the project memberships it derives carry forward. */
export type GrantedMembership = OrganisationMembership & { addedBy: string | null };

export async function getMembershipsOfOrganisations(
	supabase: SupabaseClient,
	organisationIds: string[]
): Promise<GrantedMembership[]> {
	if (organisationIds.length === 0) return [];
	const { data, error } = await supabase
		.from('organisation_members')
		.select('organisation_id, account_id, is_manager, added_by')
		.in('organisation_id', organisationIds);
	if (error) throw error;
	return data.map(parseGrantedMembership);
}

/** The organisations one account is on, as the access rules read them. */
export async function getMembershipsForAccount(
	supabase: SupabaseClient,
	accountId: string
): Promise<OrganisationMembership[]> {
	const { data, error } = await supabase
		.from('organisation_members')
		.select('organisation_id, account_id, is_manager, added_by')
		.eq('account_id', accountId);
	if (error) throw error;
	return data.map(parseGrantedMembership);
}

function parseGrantedMembership(row: Record<string, unknown>): GrantedMembership {
	return {
		organisationId: row.organisation_id as string,
		accountId: row.account_id as string,
		isManager: row.is_manager === true,
		addedBy: (row.added_by as string) ?? null
	};
}
