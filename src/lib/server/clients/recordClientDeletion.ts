import type { SupabaseClient } from '@supabase/supabase-js';

const clientWithEverythingItTakes =
	'*, client_contacts(*, contact_notes(*), contact_links(*)), client_events(*), client_job_adverts(*)';

/**
 * Writes the deletion into the record that outlives the client, under the person deleting it, with a copy
 * of the client row and everything its deletion takes with it: its ledger, its job adverts, its contacts
 * and their notes and links. Written before the client goes, so a deletion is never left unrecorded.
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

async function readClientWithHistory(
	service: SupabaseClient,
	clientId: string
): Promise<Record<string, unknown>> {
	const { data, error } = await service
		.from('clients')
		.select(clientWithEverythingItTakes)
		.eq('id', clientId)
		.single();
	if (error) throw error;
	return data as Record<string, unknown>;
}
