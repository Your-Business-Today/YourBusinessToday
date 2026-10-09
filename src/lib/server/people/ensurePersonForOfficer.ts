import type { SupabaseClient } from '@supabase/supabase-js';
import { findPersonByOfficerId } from './findPerson';
import { seniorityForOfficerRole } from '$lib/data/officerSeniority';

export type OfficerIdentity = { officerId: string; name: string; officerRole?: string };

const companiesHouseSource = 'companies_house';

export async function ensurePersonForOfficer(
	supabase: SupabaseClient,
	officer: OfficerIdentity
): Promise<string> {
	const knownPersonId = await findPersonByOfficerId(supabase, officer.officerId);
	if (knownPersonId !== null) return knownPersonId;
	const { data, error } = await supabase
		.from('people')
		.insert({
			name: officer.name,
			companies_house_officer_id: officer.officerId,
			seniority: seniorityForOfficerRole(officer.officerRole ?? ''),
			lead_source: companiesHouseSource
		})
		.select('id')
		.single();
	if (error) throw error;
	return data.id as string;
}
