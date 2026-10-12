import type { SupabaseClient } from '@supabase/supabase-js';
import { postcodeIn } from '$lib/data/postcode';
import { publicUrlOr } from '$lib/server/clients/parsePublicUrl';
import type { SightingSeed } from '$lib/data/sightingRules';

export type RecordSightingOutcome = { kind: 'recorded'; sightingId: string } | { kind: 'already_recorded' };

export const sightingOutcomes = { recorded: 'recorded', alreadyRecorded: 'already_recorded' } as const;

const uniqueViolation = '23505';

/** A validated sighting is written once: the same business on the same page in the same sector is not written twice. */
export async function recordSighting(
	supabase: SupabaseClient,
	seed: SightingSeed,
	patchId: string,
	seenByAccountId: string
): Promise<RecordSightingOutcome> {
	const { data, error } = await supabase
		.from('sightings')
		.insert({
			sector: seed.sector,
			patch_id: patchId,
			business_name: seed.businessName,
			address: seed.address,
			postcode: postcodeIn(seed.postcode),
			company_number: seed.companyNumber,
			website: publicUrlOr(seed.website, ''),
			source_url: seed.sourceUrl,
			source_kind: seed.sourceKind,
			what_was_seen: seed.whatWasSeen,
			seen_by_account_id: seenByAccountId
		})
		.select('id')
		.single();
	if (error !== null && error.code === uniqueViolation) return { kind: sightingOutcomes.alreadyRecorded };
	if (error) throw error;
	return { kind: sightingOutcomes.recorded, sightingId: data.id as string };
}

export function describeSightingOutcome(outcome: RecordSightingOutcome, seed: SightingSeed): string {
	if (outcome.kind === sightingOutcomes.alreadyRecorded) {
		return `${seed.businessName} is already recorded from that page in ${seed.sector}.`;
	}
	return `${seed.businessName} is recorded in ${seed.sector} — sighting id ${outcome.sightingId}.`;
}
