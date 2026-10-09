import type { SupabaseClient } from '@supabase/supabase-js';
import type { AffiliationSource } from './clientContactRecord';

export type Affiliation = {
	personId: string;
	clientId: string;
	role: string;
	isPrimary: boolean;
	officerRole?: string;
	appointedOn?: string;
	source?: AffiliationSource;
};

export type AffiliationOutcome = 'affiliated' | 'already_affiliated';

export const affiliationOutcomes = {
	affiliated: 'affiliated',
	alreadyAffiliated: 'already_affiliated'
} as const;

const duplicateRowCode = '23505';

/**
 * A company keeps exactly one primary contact, so the standing primary only
 * stands down once the incoming affiliation is safely in place.
 */
export async function affiliatePersonWithClient(
	supabase: SupabaseClient,
	affiliation: Affiliation
): Promise<AffiliationOutcome> {
	const { error } = await supabase.from('client_contacts').insert({
		person_id: affiliation.personId,
		client_id: affiliation.clientId,
		role: affiliation.role,
		is_primary: false,
		officer_role: affiliation.officerRole ?? '',
		appointed_on: affiliation.appointedOn === '' ? null : (affiliation.appointedOn ?? null),
		affiliation_source: affiliation.source ?? 'staff'
	});
	if (error !== null && error.code !== duplicateRowCode) throw error;
	const wasAlreadyAffiliated = error !== null;
	if (affiliation.isPrimary) await makeSolePrimary(supabase, affiliation);
	return wasAlreadyAffiliated ? 'already_affiliated' : 'affiliated';
}

async function makeSolePrimary(
	supabase: SupabaseClient,
	affiliation: Affiliation
): Promise<void> {
	const { error: standDownError } = await supabase
		.from('client_contacts')
		.update({ is_primary: false })
		.eq('client_id', affiliation.clientId)
		.eq('is_primary', true);
	if (standDownError) throw standDownError;
	const { error } = await supabase
		.from('client_contacts')
		.update({ is_primary: true })
		.eq('client_id', affiliation.clientId)
		.eq('person_id', affiliation.personId);
	if (error) throw error;
}
