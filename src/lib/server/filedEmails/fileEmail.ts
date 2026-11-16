import type { SupabaseClient } from '@supabase/supabase-js';
import type { EmailFiling, FiledEmailGiven, FilingTargetKind } from '$lib/data/filedEmailRules';

const uniqueViolation = '23505';

export const filingTargetColumns: Record<FilingTargetKind, string> = {
	client: 'client_id',
	task: 'task_id',
	todo: 'todo_id'
};

/** Where a filing left the email: the row that holds it, and whether that row was already there. */
export type FilingOutcome = { id: string; isAlreadyFiled: boolean };

/** Keeps a checked email on its client, recording who filed it; filing it again answers with the row already held. */
export async function fileEmail(supabase: SupabaseClient, email: FiledEmailGiven, filedByAccountId: string): Promise<FilingOutcome> {
	const { clientId, ...facts } = email;
	return fileEmailAgainst(supabase, { ...facts, target: { kind: 'client', id: clientId } }, filedByAccountId);
}

/** Keeps a checked email against a client, a task or a to-do; filing it again against the same one answers with the row already held. */
export async function fileEmailAgainst(supabase: SupabaseClient, filing: EmailFiling, filedByAccountId: string): Promise<FilingOutcome> {
	const { data, error } = await supabase.from('filed_emails').insert(rowOf(filing, filedByAccountId)).select('id').single();
	if (error?.code === uniqueViolation) return findFiledAlready(supabase, filing);
	if (error) throw error;
	return { id: data.id as string, isAlreadyFiled: false };
}

function rowOf(filing: EmailFiling, filedByAccountId: string): Record<string, unknown> {
	const { target } = filing;
	return {
		[filingTargetColumns[target.kind]]: target.id,
		person_id: filing.personId,
		mailbox: filing.mailbox,
		gmail_message_id: filing.messageId,
		gmail_thread_id: filing.threadId,
		direction: filing.direction,
		from_address: filing.from,
		to_addresses: filing.to,
		subject: filing.subject,
		sent_at: filing.sentAt,
		summary: filing.summary,
		filed_by_account_id: filedByAccountId
	};
}

async function findFiledAlready(supabase: SupabaseClient, filing: EmailFiling): Promise<FilingOutcome> {
	const { target } = filing;
	const { data, error } = await supabase
		.from('filed_emails')
		.select('id, mailbox')
		.eq(filingTargetColumns[target.kind], target.id)
		.eq('gmail_message_id', filing.messageId);
	if (error) throw error;
	const mailbox = filing.mailbox.toLowerCase();
	const rows = data as { id: string; mailbox: string }[];
	const held = rows.find((row) => row.mailbox.toLowerCase() === mailbox);
	if (held === undefined) throw new Error('The email was refused as filed already, yet no filing of it was found.');
	return { id: held.id, isAlreadyFiled: true };
}
