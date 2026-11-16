import type { SupabaseClient } from '@supabase/supabase-js';
import { findRecordsForEmail } from './findRecordsForEmail';
import { emailOwnerKinds, type EmailCompany, type EmailOwner } from './emailOwner';

/** Who sent an email, as far as the register can say for certain: the one client or lead they are at, and the person they are. */
export type EmailSender = { client: EmailCompany | null; personId: string | null };

const onlyOne = 1;

/** The sender of an email, named only when the register points to a single client or lead; several or none name nobody. */
export async function findEmailSender(supabase: SupabaseClient, from: string): Promise<EmailSender> {
	const [owner] = await findRecordsForEmail(supabase, [from]);
	const companies = companiesOf(owner);
	const client = companies.length === onlyOne ? companies[0] : null;
	return { client, personId: personIdOf(owner) };
}

/** Whether the email came from the given client or lead, as far as the register can say for certain. */
export function isSentByClient(sender: EmailSender, clientId: string | null): boolean {
	const { client } = sender;
	return client !== null && client.id === clientId;
}

function companiesOf(owner: EmailOwner): EmailCompany[] {
	if (owner.kind === emailOwnerKinds.person) return owner.companies;
	if (owner.kind === emailOwnerKinds.website) return owner.companies;
	return [];
}

function personIdOf(owner: EmailOwner): string | null {
	if (owner.kind === emailOwnerKinds.person) return owner.personId;
	return null;
}
