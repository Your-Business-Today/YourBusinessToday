import { findStaffMember } from '$lib/server/leadConversations/findStaffMember';
import { getStaffDirectory, type StaffMember } from './getStaffDirectory';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The staff member a connector caller names, or the caller themselves when they name nobody; null when the name fits none or several. */
export async function resolveStaffMember(
	supabase: SupabaseClient,
	givenName: string,
	callerAccountId: string
): Promise<StaffMember | null> {
	const staffMembers = await getStaffDirectory(supabase);
	if (givenName !== '') return findStaffMember(staffMembers, givenName);
	return staffMembers.find((member) => member.id === callerAccountId) ?? null;
}
