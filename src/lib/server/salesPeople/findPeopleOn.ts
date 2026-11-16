import { toStaffMember, type StaffMember } from '$lib/server/projects/getStaffDirectory';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Everyone on one organisation, named as the staff directory names them. */
export async function findPeopleOn(supabase: SupabaseClient, organisationId: string): Promise<StaffMember[]> {
	const { data, error } = await supabase.rpc('organisation_people', {
		organisation: organisationId
	});
	if (error) throw error;
	return data.map(toStaffMember);
}
