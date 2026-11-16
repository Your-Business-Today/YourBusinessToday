import type { SupabaseClient } from '@supabase/supabase-js';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';

const clientWithEverythingBeforeQuotes =
	'*, client_contacts(*, people(*)), client_events(*), client_job_adverts(*), lead_conversations(*), filed_emails(*)';

export const clientWithEverythingItTakes = `${clientWithEverythingBeforeQuotes}, lead_quotes(*, lead_quote_lines(*))`;

/**
 * Writes the deletion into the record that outlives the client, under the person deleting it, with a copy
 * of the client row and everything its deletion takes with it: its ledger, its job adverts, its
 * conversations, its filed emails, its quotes with their lines and its contacts, each with the person it names. The people, with their notes and
 * links, stay. Written before the client goes, so a deletion is never left unrecorded.
 */
export async function recordClientDeletion(
	service: SupabaseClient,
	clientId: string,
	actorAccountId: string
): Promise<string> {
	const record = await readClientWithHistory(service, clientId);
	const { data, error } = await service
		.from('client_deletions')
		.insert({ client_id: clientId, client_name: record.name, record, deleted_by_account_id: actorAccountId })
		.select('id')
		.single();
	if (error) throw error;
	return data.id as string;
}

/** Takes back the record of a deletion the database then refused, so the record only holds what happened. */
export async function withdrawClientDeletion(service: SupabaseClient, deletionId: string): Promise<void> {
	const { error } = await service.from('client_deletions').delete().eq('id', deletionId);
	if (error) throw error;
}

/** The client with everything it takes; without its quotes while their tables are not there yet, as no quote can be. */
async function readClientWithHistory(service: SupabaseClient, clientId: string): Promise<Record<string, unknown>> {
	const { data, error } = await readClientAs(service, clientId, clientWithEverythingItTakes);
	if (!isSchemaNotYetMigrated(error)) return checkedRecord(data, error);
	const before = await readClientAs(service, clientId, clientWithEverythingBeforeQuotes);
	return checkedRecord(before.data, before.error);
}

function readClientAs(service: SupabaseClient, clientId: string, columns: string) {
	return service.from('clients').select(columns).eq('id', clientId).single();
}

function checkedRecord(data: unknown, error: unknown): Record<string, unknown> {
	if (error) throw error;
	return data as Record<string, unknown>;
}
