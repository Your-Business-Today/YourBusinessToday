import { findPeopleOn } from './findPeopleOn';
import { getStaffDirectory, type StaffMember } from '$lib/server/projects/getStaffDirectory';
import { salespeopleOf } from '$lib/data/organisationSalespeople';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The people one organisation's Sales names and offers under Brought in by, never another organisation's. */
export async function loadOrganisationSalespeople(
	supabase: SupabaseClient,
	organisationId: string,
	ownerIds: (string | null)[] = []
): Promise<StaffMember[]> {
	const [members, staffMembers] = await Promise.all([findPeopleOn(supabase, organisationId), getStaffDirectory(supabase)]);
	return salespeopleOf(members, staffMembers, ownerIds);
}
