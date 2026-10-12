import type { SupabaseClient } from '@supabase/supabase-js';
import { markPremisesGone, recordAuthoritySweep, upsertPremises } from '$lib/server/premises/premisesWriter';
import { readAuthorityFile } from './readAuthorityFile';
import { validateEstablishment } from './validateEstablishment';
import type { Establishment } from './establishmentRecord';
import type { FoodAuthority } from './foodAuthorityRecord';

export type AuthoritySweep = { written: number; gone: number; refused: number };

/** One authority's whole file: the establishments in the patches' outcodes written, the rest of its rows marked gone. */
export async function sweepAuthority(supabase: SupabaseClient, authority: FoodAuthority, outcodes: Set<string>): Promise<AuthoritySweep> {
	const seenAt = new Date().toISOString();
	const inPatches = (await readAuthorityFile(authority.fileName)).filter((establishment) => outcodes.has(establishment.outcode));
	const { kept, refused } = keepWhatFits(inPatches);
	const written = await upsertPremises(supabase, kept, seenAt);
	const gone = await markPremisesGone(supabase, authority.code, seenAt);
	await recordAuthoritySweep(supabase, authority, kept.length, seenAt);
	return { written, gone, refused };
}

function keepWhatFits(establishments: Establishment[]): { kept: Establishment[]; refused: number } {
	const kept: Establishment[] = [];
	let refused = 0;
	for (const establishment of establishments) {
		const refusal = validateEstablishment(establishment);
		if (refusal === null) kept.push(establishment);
		if (refusal !== null) refused += 1;
	}
	return { kept, refused };
}
