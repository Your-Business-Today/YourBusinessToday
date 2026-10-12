import type { SupabaseClient } from '@supabase/supabase-js';
import { addProspectAsLead, type AddProspectOutcome } from '$lib/server/clients/addProspectAsLead';
import { areaEventKinds } from '$lib/data/areaEventKind';
import { recordAreaEvent } from '$lib/server/areaEvents/recordAreaEvent';
import { sectorOf } from '$lib/data/postcode';
import type { Patch } from './patchRecord';
import type { ProspectSeed } from '$lib/data/prospectRules';

/** A company from the patch register becomes a lead the way a Companies House result does, and the patch's feed says so. */
export async function addPatchCompanyAsLead(
	supabase: SupabaseClient,
	patch: Patch,
	prospect: ProspectSeed,
	actorAccountId: string
): Promise<AddProspectOutcome> {
	const outcome = await addProspectAsLead(supabase, prospect, actorAccountId);
	if (outcome.wasAlreadyListed) return outcome;
	await recordAreaEvent(supabase, {
		sector: sectorOf(prospect.postcode ?? ''),
		patchId: patch.id,
		kind: areaEventKinds.leadAddedFromRegister,
		actorAccountId,
		companyNumber: prospect.companyNumber,
		clientId: outcome.clientId,
		detail: prospect.name
	});
	return outcome;
}
