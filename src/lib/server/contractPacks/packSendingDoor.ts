import { validateRecordId } from '$lib/data/isUuid';
import { readContractPack } from './readContractPack';
import { planPackSending } from './packSendingPlan';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { PackSendingPlan } from '$lib/data/contractPack';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** The pack and contact a send or its preview names, each id checked before anything is read. */
export type PackSendingRequest = { packId: string; contactId: string | null };

/** What sending the named pack of the organisation would send, or why it cannot be sent. */
export async function planSendingOfPack(supabase: SupabaseClient, organisation: Organisation, request: PackSendingRequest): Promise<PackSendingPlan | string> {
	const refusal = validateRecordId('packId', request.packId) ?? validateContactId(request.contactId);
	if (refusal !== null) return refusal;
	const pack = await readContractPack(supabase, organisation.id, request.packId);
	if (pack === null) return `${organisation.name} has no contract pack with that id; read_contract_pack gives it.`;
	return planPackSending(supabase, organisation, pack, request.contactId);
}

function validateContactId(contactId: string | null): string | null {
	if (contactId === null) return null;
	return validateRecordId('contactId', contactId);
}
