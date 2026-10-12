import type { SupabaseClient } from '@supabase/supabase-js';
import { getClaim } from './listClaims';
import type { Patch } from '$lib/server/patches/patchRecord';

export type ClaimOutcome = { kind: 'claimed' } | { kind: 'held_by_someone_else'; holderAccountId: string } | { kind: 'not_in_patch' };

export const claimOutcomes = { claimed: 'claimed', heldBySomeoneElse: 'held_by_someone_else', notInPatch: 'not_in_patch' } as const;

/** A sector is claimed by one person at a time; claiming what you already hold renews nothing and refuses nothing. */
export async function claimSector(
	supabase: SupabaseClient,
	patch: Patch,
	sector: string,
	claimantAccountId: string
): Promise<ClaimOutcome> {
	if (!isSectorOfPatch(patch, sector)) return { kind: claimOutcomes.notInPatch };
	const existing = await getClaim(supabase, patch.id, sector);
	if (existing !== null && existing.claimedByAccountId !== claimantAccountId) {
		return { kind: claimOutcomes.heldBySomeoneElse, holderAccountId: existing.claimedByAccountId };
	}
	if (existing !== null) return { kind: claimOutcomes.claimed };
	const { error } = await supabase
		.from('sector_claims')
		.insert({ patch_id: patch.id, sector, claimed_by_account_id: claimantAccountId });
	if (error) throw error;
	return { kind: claimOutcomes.claimed };
}

export async function releaseClaim(supabase: SupabaseClient, patchId: string, sector: string): Promise<void> {
	const { error } = await supabase.from('sector_claims').delete().eq('patch_id', patchId).eq('sector', sector);
	if (error) throw error;
}

/** The claim passes to a colleague whole: the holder's name changes and nothing else. */
export async function passClaim(supabase: SupabaseClient, patchId: string, sector: string, toAccountId: string): Promise<void> {
	const { error } = await supabase
		.from('sector_claims')
		.upsert({ patch_id: patchId, sector, claimed_by_account_id: toAccountId, claimed_at: new Date().toISOString() }, { onConflict: 'patch_id,sector' });
	if (error) throw error;
}

export function isSectorOfPatch(patch: Patch, sector: string): boolean {
	const [outcode] = sector.split(' ');
	return patch.outcodes.includes(outcode ?? '');
}
