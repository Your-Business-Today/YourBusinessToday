import type { SupabaseClient } from '@supabase/supabase-js';
import { parseOrganisationMemberRecord, type OrganisationMember } from './organisationMemberRecord';

export async function getMembersOfOrganisation(
	supabase: SupabaseClient,
	organisationId: string
): Promise<OrganisationMember[]> {
	const { data, error } = await supabase.rpc('organisation_people', { organisation: organisationId });
	if (error) throw error;
	return data.map(parseOrganisationMemberRecord);
}

export function findOrganisationMember(members: OrganisationMember[], named: string): OrganisationMember | null {
	const wanted = named.toLowerCase();
	const matches = (member: OrganisationMember) =>
		member.id === named || member.email.toLowerCase() === wanted || member.name.toLowerCase() === wanted;
	return members.find(matches) ?? null;
}
