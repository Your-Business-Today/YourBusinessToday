import type { SupabaseClient } from '@supabase/supabase-js';
import { getClaim } from './listClaims';
import { isSectorOfPatch, releaseClaim } from './claimSector';
import type { Patch } from '$lib/server/patches/patchRecord';
import type { SectorSearch } from '$lib/data/sectorSearchRules';

export type SearchOutcome = { kind: 'recorded' } | { kind: 'not_in_patch' } | { kind: 'held_by_someone_else'; holderAccountId: string };

export const searchOutcomes = { recorded: 'recorded', notInPatch: 'not_in_patch', heldBySomeoneElse: 'held_by_someone_else' } as const;

/**
 * A sector is marked searched by whoever holds its claim, or by the patch owner; the claim is spent by the marking.
 * An unclaimed sector may be marked by anyone on the register, so a search is never lost for want of a claim.
 */
export async function recordSectorSearch(
	supabase: SupabaseClient,
	patch: Patch,
	search: SectorSearch,
	searcherAccountId: string
): Promise<SearchOutcome> {
	if (!isSectorOfPatch(patch, search.sector)) return { kind: searchOutcomes.notInPatch };
	const claim = await getClaim(supabase, patch.id, search.sector);
	const isHeldByAnother = claim !== null && claim.claimedByAccountId !== searcherAccountId;
	const isOwner = patch.ownerAccountId === searcherAccountId;
	if (isHeldByAnother && !isOwner) return { kind: searchOutcomes.heldBySomeoneElse, holderAccountId: claim.claimedByAccountId };
	const { error } = await supabase.from('sector_searches').insert({
		patch_id: patch.id,
		sector: search.sector,
		source: search.source,
		searched_by_account_id: searcherAccountId,
		found_count: search.foundCount,
		summary: search.summary
	});
	if (error) throw error;
	if (claim !== null) await releaseClaim(supabase, patch.id, search.sector);
	return { kind: searchOutcomes.recorded };
}
