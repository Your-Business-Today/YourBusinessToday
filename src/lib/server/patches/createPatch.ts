import type { SupabaseClient } from '@supabase/supabase-js';
import { cacheLocations } from '$lib/server/postcodes/postcodeLocationCache';
import { findOutcodesWithin } from '$lib/server/postcodes/findOutcodesWithin';
import { lookupPostcode } from '$lib/server/postcodes/lookupPostcode';
import { milesToMetres } from '$lib/data/mapRadii';
import type { PatchSeed } from '$lib/data/patchRules';
import type { PostcodeLocation } from '$lib/server/postcodes/postcodeLocation';

export const patchOutcomes = {
	created: 'created',
	unknownPostcode: 'unknown_postcode',
	nameTaken: 'name_taken'
} as const;

export type CreatePatchOutcome =
	| { kind: typeof patchOutcomes.created; patchId: string }
	| { kind: typeof patchOutcomes.unknownPostcode }
	| { kind: typeof patchOutcomes.nameTaken };

const uniqueViolation = '23505';

/** A validated seed becomes a patch with its outcodes laid out, or says why it could not. */
export async function createPatch(
	supabase: SupabaseClient,
	seed: PatchSeed,
	ownerAccountId: string
): Promise<CreatePatchOutcome> {
	const centre = await lookupPostcode(seed.centrePostcode);
	if (centre === null) return { kind: patchOutcomes.unknownPostcode };
	const outcodes = await findOutcodesWithin(centre, milesToMetres(seed.radiusMiles));
	await cacheLocations(supabase, [centre]);
	const patchId = await insertPatch(supabase, seed, centre, ownerAccountId);
	if (patchId === null) return { kind: patchOutcomes.nameTaken };
	await insertOutcodes(supabase, patchId, [...new Set([centre.outcode, ...outcodes])]);
	return { kind: patchOutcomes.created, patchId };
}

export function refusalFor(outcome: CreatePatchOutcome, seed: PatchSeed): string | null {
	if (outcome.kind === patchOutcomes.unknownPostcode) {
		return `${seed.centrePostcode} is not a postcode the Royal Mail knows — check it and try again.`;
	}
	if (outcome.kind === patchOutcomes.nameTaken) return `A patch called ${seed.name} already exists.`;
	return null;
}

async function insertPatch(
	supabase: SupabaseClient,
	seed: PatchSeed,
	centre: PostcodeLocation,
	ownerAccountId: string
): Promise<string | null> {
	const { data, error } = await supabase
		.from('patches')
		.insert({
			name: seed.name,
			centre_postcode: centre.postcode,
			radius_miles: seed.radiusMiles,
			sic_codes: seed.sicCodes,
			owner_account_id: ownerAccountId
		})
		.select('id')
		.single();
	if (error !== null && error.code === uniqueViolation) return null;
	if (error) throw error;
	return data.id as string;
}

async function insertOutcodes(supabase: SupabaseClient, patchId: string, outcodes: string[]): Promise<void> {
	const { error } = await supabase
		.from('patch_outcodes')
		.insert(outcodes.map((outcode) => ({ patch_id: patchId, outcode })));
	if (error) throw error;
}
