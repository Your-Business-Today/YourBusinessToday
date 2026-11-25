import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { countersignContractPack } from './countersignContractPack';
import { countersignRefusal } from './countersignRefusals';
import { readContractPack } from './readContractPack';
import { validateCountersignature } from './validateCountersignature';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ContractPack } from '$lib/data/contractPack';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** The YBT director at the door: their own client, their account, and the client organisation already reached. */
export type CountersigningDirector = { supabase: SupabaseClient; accountId: string; organisation: Organisation };

const notThisOrganisationsPack = "That pack is not this organisation's: read_contract_pack gives its pack id.";

/**
 * The countersigning door the screen and the connector share: the countersignature checked against its columns, the
 * pack checked as ready, then each document kept as a signed PDF and the pack countersigned. Gives the pack as it now
 * stands, or why not.
 */
export async function countersignPack(director: CountersigningDirector, input: Record<string, unknown>): Promise<ContractPack | string> {
	const given = validateCountersignature(input);
	if (typeof given === 'string') return given;
	const { supabase, accountId, organisation } = director;
	const pack = await readContractPack(supabase, organisation.id, given.packId);
	if (pack === null) return notThisOrganisationsPack;
	const refusal = countersignRefusal(pack);
	if (refusal !== null) return refusal;
	await countersignContractPack({ supabase, service: supabaseServiceClient(), accountId, organisation }, pack, given);
	return (await readContractPack(supabase, organisation.id, pack.id)) ?? pack;
}
