import type { SupabaseClient } from '@supabase/supabase-js';
import { findAccountByEmail } from '$lib/server/accounts/findAccountByEmail';
import { isSectorOfPatch, passClaim } from './claimSector';
import { resolveAccountStanding } from '$lib/server/mcp/resolveAccountStanding';
import type { Patch } from '$lib/server/patches/patchRecord';

export type HandOverOutcome = { kind: 'handed'; toName: string } | { kind: 'no_such_colleague' } | { kind: 'not_in_patch' };

export const handOverOutcomes = { handed: 'handed', noSuchColleague: 'no_such_colleague', notInPatch: 'not_in_patch' } as const;

/** A sector is handed to a colleague found by email, who must be staff; the claim passes whole. */
export async function handSectorTo(supabase: SupabaseClient, patch: Patch, sector: string, email: string): Promise<HandOverOutcome> {
	if (!isSectorOfPatch(patch, sector)) return { kind: handOverOutcomes.notInPatch };
	const colleague = await findAccountByEmail(supabase, email);
	if (colleague === null) return { kind: handOverOutcomes.noSuchColleague };
	const standing = await resolveAccountStanding(supabase, colleague.id);
	if (standing === null || !standing.isStaff) return { kind: handOverOutcomes.noSuchColleague };
	await passClaim(supabase, patch.id, sector, colleague.id);
	return { kind: handOverOutcomes.handed, toName: colleague.name };
}
