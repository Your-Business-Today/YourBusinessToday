import type { SupabaseClient } from '@supabase/supabase-js';
import { accountNameLookup } from '$lib/data/accountNames';
import { claimOutcomes, type ClaimOutcome } from './claimSector';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { handOverOutcomes, type HandOverOutcome } from './handSectorTo';
import { searchOutcomes, type SearchOutcome } from './recordSectorSearch';

export const sectorNotInPatch = 'That sector is not in this patch: list_patch_sectors names the ones that are.';
export const noSuchColleague = 'No staff member has that email address.';

/** What the site and the connector both say back, so a refusal reads the same in either. */
export async function describeClaimOutcome(supabase: SupabaseClient, outcome: ClaimOutcome, sector: string): Promise<string> {
	if (outcome.kind === claimOutcomes.notInPatch) return sectorNotInPatch;
	if (outcome.kind === claimOutcomes.heldBySomeoneElse) return await heldBy(supabase, sector, outcome.holderAccountId);
	return `${sector} is yours: search it, then mark it searched with one line on what was done.`;
}

export async function describeSearchOutcome(supabase: SupabaseClient, outcome: SearchOutcome, sector: string): Promise<string> {
	if (outcome.kind === searchOutcomes.notInPatch) return sectorNotInPatch;
	if (outcome.kind === searchOutcomes.heldBySomeoneElse) return await heldBy(supabase, sector, outcome.holderAccountId);
	return `${sector} is marked searched.`;
}

export function describeHandOverOutcome(outcome: HandOverOutcome, sector: string): string {
	if (outcome.kind === handOverOutcomes.notInPatch) return sectorNotInPatch;
	if (outcome.kind === handOverOutcomes.noSuchColleague) return noSuchColleague;
	return `${sector} is now with ${outcome.toName}.`;
}

async function heldBy(supabase: SupabaseClient, sector: string, holderAccountId: string): Promise<string> {
	const holders = await getAccountsById(supabase, [holderAccountId]);
	const holderName = accountNameLookup(holders)(holderAccountId);
	return `${sector} is claimed by ${holderName}; claim it after they release it, or ask them to hand it to you.`;
}
