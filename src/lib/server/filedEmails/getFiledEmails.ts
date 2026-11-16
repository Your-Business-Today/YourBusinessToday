import type { SupabaseClient } from '@supabase/supabase-js';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { filingTargetColumns } from './fileEmail';
import type { FiledEmail, FiledEmailDirection, FilingTarget } from '$lib/data/filedEmailRules';

const nobodyNamed = '';
const filedEmailColumns =
	'id, person_id, mailbox, gmail_message_id, gmail_thread_id, direction, from_address, to_addresses, subject, sent_at, summary, filed_at, people (name)';

/** The emails filed under a client, the latest sent first; all of them unless a most is given. */
export async function getEmailsForClient(supabase: SupabaseClient, clientId: string, most?: number): Promise<FiledEmail[]> {
	return getEmailsFiledAgainst(supabase, { kind: 'client', id: clientId }, most);
}

/** The emails filed against a task, the ones it was raised from among them, the latest sent first. */
export async function getEmailsForTask(supabase: SupabaseClient, taskId: string): Promise<FiledEmail[]> {
	return getEmailsFiledAgainst(supabase, { kind: 'task', id: taskId });
}

async function getEmailsFiledAgainst(supabase: SupabaseClient, target: FilingTarget, most?: number): Promise<FiledEmail[]> {
	const query = supabase
		.from('filed_emails')
		.select(filedEmailColumns)
		.eq(filingTargetColumns[target.kind], target.id)
		.order('sent_at', { ascending: false });
	const { data, error } = await (most === undefined ? query : query.limit(most));
	if (isSchemaNotYetMigrated(error)) return [];
	if (error) throw error;
	return (data as Record<string, unknown>[]).map(parseFiledEmail);
}

export function parseFiledEmail(row: Record<string, unknown>): FiledEmail {
	const person = row.people as { name: string } | null;
	return {
		id: row.id as string,
		personId: (row.person_id ?? null) as string | null,
		personName: person?.name ?? nobodyNamed,
		mailbox: row.mailbox as string,
		messageId: row.gmail_message_id as string,
		threadId: row.gmail_thread_id as string,
		direction: row.direction as FiledEmailDirection,
		from: row.from_address as string,
		to: (row.to_addresses ?? []) as string[],
		subject: row.subject as string,
		sentAt: row.sent_at as string,
		summary: row.summary as string,
		filedAt: row.filed_at as string
	};
}
