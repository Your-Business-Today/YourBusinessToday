import type { SupabaseClient } from '@supabase/supabase-js';
import { cacheLocations } from '$lib/server/postcodes/postcodeLocationCache';
import { findOutcodesWithin, mostOutcodes } from '$lib/server/postcodes/findOutcodesWithin';
import { lookupPostcode } from '$lib/server/postcodes/lookupPostcode';
import { milesToMetres } from '$lib/data/mapRadii';
import type { PatchSeed } from '$lib/data/patchRules';
import type { PostcodeLocation } from '$lib/server/postcodes/postcodeLocation';

export const patchOutcomes = {
	created: 'created',
	unknownPostcode: 'unknown_postcode',
	nameTaken: 'name_taken',
	tooWide: 'too_wide'
} as const;

export type CreatePatchOutcome =
	| { kind: typeof patchOutcomes.created; patchId: string }
	| { kind: typeof patchOutcomes.unknownPostcode }
	| { kind: typeof patchOutcomes.nameTaken }
	| { kind: typeof patchOutcomes.tooWide };

const uniqueViolation = '23505';

/** A validated seed becomes a patch with its outcodes laid out in one transaction, or says why it could not. */
export async function createPatch(
	supabase: SupabaseClient,
	seed: PatchSeed,
	ownerAccountId: string
): Promise<CreatePatchOutcome> {
	const centre = await lookupPostcode(seed.centrePostcode);
	if (centre === null) return { kind: patchOutcomes.unknownPostcode };
	const outcodes = await findOutcodesWithin(centre, milesToMetres(seed.radiusMiles));
	if (outcodes.length >= mostOutcodes) return { kind: patchOutcomes.tooWide };
	await cacheLocations(supabase, [centre]);
	const patchId = await insertPatchWithOutcodes(supabase, seed, centre, ownerAccountId, [...new Set([centre.outcode, ...outcodes])]);
	if (patchId === null) return { kind: patchOutcomes.nameTaken };
	return { kind: patchOutcomes.created, patchId };
}

export function refusalFor(outcome: CreatePatchOutcome, seed: PatchSeed): string | null {
	const refusals: Record<string, string> = {
		[patchOutcomes.unknownPostcode]: `${seed.centrePostcode} is not a postcode the Royal Mail knows — check it and try again.`,
		[patchOutcomes.nameTaken]: `A patch called ${seed.name} already exists.`,
		[patchOutcomes.tooWide]: `${seed.radiusMiles} miles around ${seed.centrePostcode} covers more outcodes than can be laid out at once — choose a smaller radius.`
	};
	return refusals[outcome.kind] ?? null;
}

async function insertPatchWithOutcodes(
	supabase: SupabaseClient,
	seed: PatchSeed,
	centre: PostcodeLocation,
	ownerAccountId: string,
	outcodes: string[]
): Promise<string | null> {
	const { data, error } = await supabase.rpc('create_patch', {
		patch_name: seed.name,
		patch_centre_postcode: centre.postcode,
		patch_radius_miles: seed.radiusMiles,
		patch_sic_codes: seed.sicCodes,
		patch_owner: ownerAccountId,
		patch_outcodes: outcodes
	});
	if (error !== null && error.code === uniqueViolation) return null;
	if (error) throw error;
	return data as string;
}
