import { refusalToDeleteClient, refusalWhileStillNamed } from '$lib/data/clientDeletion';
import { readClientStanding } from './readClientStanding';
import { recordClientDeletion, withdrawClientDeletion } from './recordClientDeletion';
import type { Client } from './clientRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

const PostgresErrorCode = { ForeignKeyViolation: '23503' } as const;

/**
 * Deletes a duplicate or mistaken client from the register, recorded under the person deleting it, and
 * answers null; or answers why the client stays, deleting nothing. A client with projects, invoices,
 * companies grouped under it or a continuity copy is a real relationship and always stays.
 */
export async function deleteClientRecord(
	service: SupabaseClient,
	client: Client,
	actorAccountId: string
): Promise<string | null> {
	const standing = await readClientStanding(service, client);
	const refusal = refusalToDeleteClient(client.name, standing);
	if (refusal !== null) return refusal;
	const deletionId = await recordClientDeletion(service, client.id, actorAccountId);
	const { error } = await service.from('clients').delete().eq('id', client.id);
	if (error === null) return null;
	await withdrawClientDeletion(service, deletionId);
	const isStillNamed = error.code === PostgresErrorCode.ForeignKeyViolation;
	if (isStillNamed) return refusalWhileStillNamed(client.name);
	throw error;
}
