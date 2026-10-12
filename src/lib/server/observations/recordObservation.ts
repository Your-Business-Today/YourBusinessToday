import type { SupabaseClient } from '@supabase/supabase-js';
import { areaEventKinds } from '$lib/data/areaEventKind';
import { findClientByCompanyNumber } from '$lib/server/clients/findClientByNumber';
import { getRegisterCompany } from '$lib/server/register/getRegisterCompany';
import { getSighting } from '$lib/server/sightings/listSightings';
import { recordAreaEvent } from '$lib/server/areaEvents/recordAreaEvent';
import type { ObservationSeed } from '$lib/data/observationRules';
import type { Patch } from '$lib/server/patches/patchRecord';

export type ObservationOutcome = { kind: 'recorded' } | { kind: 'already_recorded' } | { kind: 'unknown_subject' };

export const observationOutcomes = { recorded: 'recorded', alreadyRecorded: 'already_recorded', unknownSubject: 'unknown_subject' } as const;

const uniqueViolation = '23505';

/** A validated observation about a register company or a sighting is written once per page per patch, and the feed is told. */
export async function recordObservation(
	supabase: SupabaseClient,
	patch: Patch,
	seed: ObservationSeed,
	observerAccountId: string
): Promise<ObservationOutcome> {
	const subject = await subjectOf(supabase, seed);
	if (subject === null) return { kind: observationOutcomes.unknownSubject };
	const isNew = await insertObservation(supabase, patch, seed, subject, observerAccountId);
	if (!isNew) return { kind: observationOutcomes.alreadyRecorded };
	await recordAreaEvent(supabase, {
		sector: subject.sector,
		patchId: patch.id,
		kind: areaEventKinds.observationRecorded,
		actorAccountId: observerAccountId,
		companyNumber: seed.companyNumber,
		clientId: subject.clientId,
		detail: `${subject.name}: ${seed.headline}`,
		sourceUrl: seed.sourceUrl
	});
	return { kind: observationOutcomes.recorded };
}

type Subject = { name: string; sector: string; clientId: string | null };

/** The row itself; false when the page is already recorded for the patch. */
async function insertObservation(
	supabase: SupabaseClient,
	patch: Patch,
	seed: ObservationSeed,
	subject: Subject,
	observerAccountId: string
): Promise<boolean> {
	const { error } = await supabase.from('observations').insert({
		patch_id: patch.id,
		company_number: seed.companyNumber,
		sighting_id: seed.sightingId === '' ? null : seed.sightingId,
		client_id: subject.clientId,
		kind: seed.kind,
		headline: seed.headline,
		source_url: seed.sourceUrl,
		observed_by_account_id: observerAccountId
	});
	if (error !== null && error.code === uniqueViolation) return false;
	if (error) throw error;
	return true;
}

/** The business observed: a company the register holds, or a sighting; anything else is refused. */
async function subjectOf(supabase: SupabaseClient, seed: ObservationSeed): Promise<Subject | null> {
	if (seed.companyNumber !== '') {
		const company = await getRegisterCompany(supabase, seed.companyNumber);
		if (company === null) return null;
		return { name: company.name, sector: company.sector, clientId: await findClientByCompanyNumber(supabase, company.companyNumber) };
	}
	const sighting = await getSighting(supabase, seed.sightingId);
	if (sighting === null) return null;
	return { name: sighting.businessName, sector: sighting.sector, clientId: sighting.clientId };
}
