import type { SupabaseClient } from '@supabase/supabase-js';
import { areaEventKinds } from '$lib/data/areaEventKind';
import { createClient } from '$lib/server/clients/createClient';
import { emptyCompanyProfile } from '$lib/server/clients/companyProfile';
import { recordAreaEvent } from '$lib/server/areaEvents/recordAreaEvent';
import type { Premises } from './premisesRecord';

export type PremisesLeadOutcome = { clientId: string; wasAlreadyListed: boolean };

/** A premises becomes a lead with the agency's page kept as the source; one already a client keeps that row. */
export async function addPremisesAsLead(
	supabase: SupabaseClient,
	premises: Premises,
	patchId: string,
	actorAccountId: string
): Promise<PremisesLeadOutcome> {
	if (premises.clientId !== null) return { clientId: premises.clientId, wasAlreadyListed: true };
	const profile = { ...emptyCompanyProfile, industry: premises.businessType, location: premises.address, postcode: premises.postcode, sourceUrl: premises.sourceUrl };
	const seed = { name: premises.businessName, website: '', ownerId: actorAccountId, source: 'food_hygiene' as const, profile };
	const clientId = await createClient(supabase, seed, actorAccountId);
	await tieToLead(supabase, premises.id, clientId);
	await recordAreaEvent(supabase, {
		sector: premises.sector,
		patchId,
		kind: areaEventKinds.leadAddedFromPremises,
		actorAccountId,
		clientId,
		detail: premises.businessName,
		sourceUrl: premises.sourceUrl
	});
	return { clientId, wasAlreadyListed: false };
}

/** The one door a premises is tied to its lead through: the database's own function, which refuses anyone but staff and a premises that is a lead already. */
async function tieToLead(supabase: SupabaseClient, premisesId: string, clientId: string): Promise<void> {
	const { error } = await supabase.rpc('tie_premises_to_client', { premises_id: premisesId, lead_client_id: clientId });
	if (error) throw error;
}
