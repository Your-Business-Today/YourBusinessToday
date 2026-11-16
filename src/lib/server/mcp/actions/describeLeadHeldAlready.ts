import type { SupabaseClient } from '@supabase/supabase-js';
import type { EmailOwner } from '$lib/server/filedEmails/emailOwner';
import { getClient } from '$lib/server/clients/getClient';
import { heldAlreadyKinds, type HeldAlready } from '$lib/server/leadsFromEmail/leadFromEmail';
import { describeEmailOwners } from './describeEmailOwners';

const fileUnderItInstead = 'File the email under it with file_email_to_client instead.';

/** Why no lead was added: the record that already holds the sender or their company, and what to do instead. */
export async function describeLeadHeldAlready(supabase: SupabaseClient, heldAlready: HeldAlready): Promise<string> {
	if (heldAlready.kind === heldAlreadyKinds.sender) return describeSenderHeld(heldAlready.owner);
	const client = await getClient(supabase, heldAlready.clientId);
	const clientName = client?.name ?? 'A client';
	return `Nothing was added: ${clientName} is already on the register — client ${heldAlready.clientId}. ${fileUnderItInstead}`;
}

function describeSenderHeld(owner: EmailOwner): string {
	return `Nothing was added: the sender is already held.\n${describeEmailOwners([owner])}\n${fileUnderItInstead}`;
}
