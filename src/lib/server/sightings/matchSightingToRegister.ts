import type { SupabaseClient } from '@supabase/supabase-js';
import { getRegisterCompany } from '$lib/server/register/getRegisterCompany';

export type MatchOutcome = { kind: 'matched'; registeredName: string } | { kind: 'not_on_register' };

export const matchOutcomes = { matched: 'matched', notOnRegister: 'not_on_register' } as const;

/** A sighting is stamped with a company number only when the register holds that number. */
export async function matchSightingToRegister(
	supabase: SupabaseClient,
	sightingId: string,
	companyNumber: string
): Promise<MatchOutcome> {
	const company = await getRegisterCompany(supabase, companyNumber);
	if (company === null) return { kind: matchOutcomes.notOnRegister };
	const { error } = await supabase.from('sightings').update({ company_number: company.companyNumber }).eq('id', sightingId);
	if (error) throw error;
	return { kind: matchOutcomes.matched, registeredName: company.name };
}
