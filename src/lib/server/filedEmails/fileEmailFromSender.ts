import type { SupabaseClient } from '@supabase/supabase-js';
import { fileEmailAgainst } from './fileEmail';
import type { EmailFacts, FilingTarget } from '$lib/data/filedEmailRules';
import type { EmailSender } from './findEmailSender';

/** An email that set something off: what it says, who sent it, and the task or to-do it set off. */
export type EmailSource = { facts: EmailFacts; sender: EmailSender; raised: FilingTarget };

const nobodyKnown =
	'The sender is not one client or lead we hold, so it is filed under none: file it with file_email_to_client once you know whose it is.';

/** Files the email against what it set off, and under the sender's client or lead too; says where it went. */
export async function fileEmailFromSender(supabase: SupabaseClient, source: EmailSource, filedByAccountId: string): Promise<string> {
	const { facts, sender, raised } = source;
	const personId = sender.personId;
	const raisedFiling = await fileEmailAgainst(supabase, { ...facts, personId, target: raised }, filedByAccountId);
	const kept = `The email is kept as its source (filed email ${raisedFiling.id}).`;
	const client = sender.client;
	if (client === null) return `${kept} ${nobodyKnown}`;
	await fileEmailAgainst(supabase, { ...facts, personId, target: { kind: 'client', id: client.id } }, filedByAccountId);
	return `${kept} It is filed under ${client.name} too: label the thread YBT/${client.name} in Gmail.`;
}
