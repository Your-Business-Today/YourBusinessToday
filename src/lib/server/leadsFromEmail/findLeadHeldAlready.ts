import type { SupabaseClient } from '@supabase/supabase-js';
import { emailOwnerKinds } from '$lib/server/filedEmails/emailOwner';
import { findClientByCompanyNumber, findNumberlessClientByName } from '$lib/server/clients/findClientByNumber';
import { findRecordsForEmail } from '$lib/server/filedEmails/findRecordsForEmail';
import { heldAlreadyKinds, noCompanyNumber, type HeldAlready, type NewLead } from './leadFromEmail';

/** The record that already holds the sender or their company, or null when the lead is new to us. */
export async function findLeadHeldAlready(supabase: SupabaseClient, lead: NewLead, senderAddress: string): Promise<HeldAlready | null> {
	const [sender] = await findRecordsForEmail(supabase, [senderAddress]);
	if (sender.kind !== emailOwnerKinds.nobody) return { kind: heldAlreadyKinds.sender, owner: sender };
	if (lead.isPrivateIndividual) return null;
	const clientId = await findCompanyHeld(supabase, lead);
	if (clientId === null) return null;
	return { kind: heldAlreadyKinds.company, clientId };
}

async function findCompanyHeld(supabase: SupabaseClient, lead: NewLead): Promise<string | null> {
	const isNumbered = lead.companyNumber !== noCompanyNumber;
	const numberedClientId = isNumbered ? await findClientByCompanyNumber(supabase, lead.companyNumber) : null;
	if (numberedClientId !== null) return numberedClientId;
	return findNumberlessClientByName(supabase, lead.leadName);
}
