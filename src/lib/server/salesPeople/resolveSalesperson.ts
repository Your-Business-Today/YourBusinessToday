import { findStaffMember } from '$lib/server/leadConversations/findStaffMember';
import { loadOrganisationSalespeople } from './loadOrganisationSalespeople';
import type { StaffMember } from '$lib/server/projects/getStaffDirectory';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The one person on the organisation a connector caller names, or the caller when they name nobody; null when none or several fit. */
export async function resolveSalesperson(
	supabase: SupabaseClient,
	organisationId: string,
	givenName: string,
	callerAccountId: string
): Promise<StaffMember | null> {
	const salespeople = await loadOrganisationSalespeople(supabase, organisationId);
	if (givenName !== '') return findStaffMember(salespeople, givenName);
	return salespeople.find((person) => person.id === callerAccountId) ?? null;
}
