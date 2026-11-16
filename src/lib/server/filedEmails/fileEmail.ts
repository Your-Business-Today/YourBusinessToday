import type { SupabaseClient } from '@supabase/supabase-js';
import type { FiledEmailGiven } from '$lib/data/filedEmailRules';

const uniqueViolation = '23505';

/** Where a filing left the email: the row that holds it, and whether that row was already there. */
export type FilingOutcome = { id: string; isAlreadyFiled: boolean };

/** Keeps a checked email on its client, recording who filed it; filing it again answers with the row already held. */
export async function fileEmail(supabase: SupabaseClient, email: FiledEmailGiven, filedByAccountId: string): Promise<FilingOutcome> {
	const { data, error } = await supabase.from('filed_emails').insert(rowOf(email, filedByAccountId)).select('id').single();
	if (error?.code === uniqueViolation) return findFiledAlready(supabase, email);
	if (error) throw error;
	return { id: data.id as string, isAlreadyFiled: false };
}

function rowOf(email: FiledEmailGiven, filedByAccountId: string): Record<string, unknown> {
	return {
		client_id: email.clientId,
		person_id: email.personId,
		mailbox: email.mailbox,
		gmail_message_id: email.messageId,
		gmail_thread_id: email.threadId,
		direction: email.direction,
		from_address: email.from,
		to_addresses: email.to,
		subject: email.subject,
		sent_at: email.sentAt,
		summary: email.summary,
		filed_by_account_id: filedByAccountId
	};
}

async function findFiledAlready(supabase: SupabaseClient, email: FiledEmailGiven): Promise<FilingOutcome> {
	const { data, error } = await supabase
		.from('filed_emails')
		.select('id, mailbox')
		.eq('client_id', email.clientId)
		.eq('gmail_message_id', email.messageId);
	if (error) throw error;
	const mailbox = email.mailbox.toLowerCase();
	const rows = data as { id: string; mailbox: string }[];
	const held = rows.find((row) => row.mailbox.toLowerCase() === mailbox);
	if (held === undefined) throw new Error('The email was refused as filed already, yet no filing of it was found.');
	return { id: held.id, isAlreadyFiled: true };
}
