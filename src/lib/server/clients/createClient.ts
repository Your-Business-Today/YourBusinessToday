import type { SupabaseClient } from '@supabase/supabase-js';
import type { LeadSource } from '$lib/data/leadSources';
import { emptyCompanyProfile, toCompanyProfileColumns, type CompanyProfile } from './companyProfile';
import { recordClientEvent } from './recordClientEvent';

export type NewClientSeed = {
	name: string;
	website: string;
	ownerId: string | null;
	source?: LeadSource;
	profile?: CompanyProfile;
};

export async function createClient(
	supabase: SupabaseClient,
	seed: NewClientSeed,
	actorAccountId: string
): Promise<string> {
	const source = seed.source ?? 'staff';
	const { data, error } = await supabase
		.from('clients')
		.insert({
			name: seed.name,
			website: seed.website,
			owner_id: seed.ownerId,
			lead_source: source,
			...toCompanyProfileColumns(seed.profile ?? emptyCompanyProfile)
		})
		.select('id')
		.single();
	if (error) throw error;
	await recordClientEvent(supabase, data.id, 'lead_added', { source, name: seed.name }, actorAccountId);
	return data.id;
}
