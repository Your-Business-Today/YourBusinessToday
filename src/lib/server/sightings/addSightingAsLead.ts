import type { SupabaseClient } from '@supabase/supabase-js';
import { areaEventKinds } from '$lib/data/areaEventKind';
import { createClient } from '$lib/server/clients/createClient';
import { emptyCompanyProfile } from '$lib/server/clients/companyProfile';
import { findClientByCompanyNumber } from '$lib/server/clients/findClientByNumber';
import { recordAreaEvent } from '$lib/server/areaEvents/recordAreaEvent';
import { recordClientEvent } from '$lib/server/clients/recordClientEvent';
import type { Sighting } from './sightingRecord';

export type SightingLeadOutcome = { clientId: string; wasAlreadyListed: boolean };

/** A sighting becomes a lead with its page kept as the source; one already matched to a client on the register claims that row. */
export async function addSightingAsLead(
	supabase: SupabaseClient,
	sighting: Sighting,
	actorAccountId: string
): Promise<SightingLeadOutcome> {
	const existingClientId = await existingClientFor(supabase, sighting);
	if (existingClientId !== null) {
		await stampClient(supabase, sighting.id, existingClientId);
		return { clientId: existingClientId, wasAlreadyListed: true };
	}
	const clientId = await createClientFromSighting(supabase, sighting, actorAccountId);
	await stampClient(supabase, sighting.id, clientId);
	await recordClientEvent(supabase, clientId, 'sighted', { sector: sighting.sector, sourceUrl: sighting.sourceUrl }, actorAccountId);
	await recordLeadEvent(supabase, sighting, clientId, actorAccountId);
	return { clientId, wasAlreadyListed: false };
}

function createClientFromSighting(supabase: SupabaseClient, sighting: Sighting, actorAccountId: string): Promise<string> {
	const profile = {
		...emptyCompanyProfile,
		location: sighting.address,
		postcode: sighting.postcode,
		companyNumber: sighting.companyNumber,
		sourceUrl: sighting.sourceUrl
	};
	const seed = { name: sighting.businessName, website: sighting.website, ownerId: actorAccountId, source: 'sighting' as const, profile };
	return createClient(supabase, seed, actorAccountId);
}

function recordLeadEvent(supabase: SupabaseClient, sighting: Sighting, clientId: string, actorAccountId: string): Promise<void> {
	return recordAreaEvent(supabase, {
		sector: sighting.sector,
		patchId: sighting.patchId,
		kind: areaEventKinds.sightingBecameLead,
		actorAccountId,
		sightingId: sighting.id,
		clientId,
		companyNumber: sighting.companyNumber,
		detail: sighting.businessName,
		sourceUrl: sighting.sourceUrl
	});
}

async function existingClientFor(supabase: SupabaseClient, sighting: Sighting): Promise<string | null> {
	if (sighting.clientId !== null) return sighting.clientId;
	if (sighting.companyNumber === '') return null;
	return findClientByCompanyNumber(supabase, sighting.companyNumber);
}

async function stampClient(supabase: SupabaseClient, sightingId: string, clientId: string): Promise<void> {
	const { error } = await supabase.from('sightings').update({ client_id: clientId }).eq('id', sightingId);
	if (error) throw error;
}
